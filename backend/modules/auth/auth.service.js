const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Author = require('../authors/author.model')
const HttpError = require('../../utils/HttpError')

const createToken = author => jwt.sign({ id: author._id }, process.env.JWT_SECRET, { // lo stesso token per il login normale e per Google
    expiresIn: '1d', // il token scade dopo un giorno
})

const createLinkToken = author => jwt.sign({ id: author._id, purpose: 'google-link' }, process.env.JWT_SECRET, { // "Collega Google": quale autore sta collegando il suo account
    expiresIn: '15m', // come il cookie che lo contiene
})

const login = async ({ email, password }) => {
    const author = await Author.findOne({ email })
    if (!author || !author.password || !(await bcrypt.compare(password, author.password))) { // confronta la password con quella criptata (chi è entrato con Google non ha password)
        throw new HttpError(401, "Wrong email or password")
    }
    return createToken(author)
}

const findOrCreateGoogleAuthor = async profile => { // profile: i dati dell'utente che arrivano da Google
    const googleAuthor = await Author.findOne({ googleId: profile.id }) // creato o collegato con questo account Google in un login precedente
    if (googleAuthor) {
        return googleAuthor
    }
    const email = profile.emails?.find(emailAddress => emailAddress.verified)?.value // per un nuovo autore serve un'email verificata da Google
    if (!email) {
        return null
    }
    if (await Author.exists({ email })) { // l'email è già di un account con password: chiunque può registrare l'email di un altro, quindi Google lo apre solo dopo "Collega Google"
        throw new HttpError(409, "This email already has an account with a password, log in with email and password")
    }
    return Author.create({ // primo accesso con Google, si crea l'autore
        name: profile.name?.givenName || profile.displayName, // senza nome, il nome completo dell'account Google
        surname: profile.name?.familyName || '-', // alcuni account Google non hanno il cognome
        email,
        avatar: profile.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || email)}`, // senza foto Google, l'avatar con le iniziali come nella registrazione
        googleId: profile.id,
    })
}

const linkGoogleAuthor = async (linkToken, profile) => { // "Collega Google": aggiunge l'account Google all'autore che ha cliccato il pulsante
    const { id, purpose } = jwt.verify(linkToken, process.env.JWT_SECRET) // token scaduto o falso: errore, si torna al login
    if (purpose !== 'google-link') { // un token di accesso normale non vale per collegare
        throw new HttpError(400, "Invalid link token")
    }
    const googleAuthor = await Author.findOne({ googleId: profile.id })
    if (googleAuthor && !googleAuthor._id.equals(id)) { // questo account Google apre già un altro autore
        throw new HttpError(409, "This Google account is already linked to another author")
    }
    const author = await Author.findByIdAndUpdate(id, { googleId: profile.id }, {
        returnDocument: 'after', // l'autore con il googleId appena salvato
    })
    if (!author) {
        throw new HttpError(404, "Author not found")
    }
    return author
}

module.exports = {
    createToken,
    createLinkToken,
    login,
    findOrCreateGoogleAuthor,
    linkGoogleAuthor,
}
