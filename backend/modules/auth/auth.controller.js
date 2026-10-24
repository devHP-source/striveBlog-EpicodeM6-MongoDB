const crypto = require('crypto')
const passport = require('./google.strategy') // passport con la strategia di Google già registrata
const authService = require('./auth.service')
const HttpError = require('../../utils/HttpError')

const GOOGLE_COOKIE = { // i cookie del login con Google: il JavaScript delle pagine non li legge e il browser li manda solo a /auth/google/...
    httpOnly: true,
    sameSite: 'lax', // frontend e backend sullo stesso sito (qui entrambi su localhost)
    path: '/auth/google',
}

const login = async (request, response) => {
    const accessToken = await authService.login(request.body) // email e password già controllate da loginRules
    response.status(200)
        .send({
            accessToken
        })
}

const me = (request, response) => {
    response.status(200)
        .send({
            ...request.author.toJSON(), // l'utente del token, arriva da verifyToken
            googleLinked: Boolean(request.author.googleId), // false: il frontend mostra "Collega Google"
        })
}

const googleLogin = (request, response, next) => { // porta l'utente alla pagina di login di Google
    if (request.query.link !== '1') { // login normale: un "Collega Google" lasciato a metà non deve collegare niente
        response.clearCookie('googleLink', GOOGLE_COOKIE)
    } else if (!request.cookies.googleLink) { // "Collega Google" senza il suo cookie (scaduto): niente da collegare
        return response.redirect(`${process.env.FRONTEND_URL}/login?error=google`)
    }
    const state = crypto.randomBytes(16).toString('hex') // un codice casuale che Google rimanda uguale al callback (lo controlla checkGoogleState)
    response.cookie('googleState', state, { ...GOOGLE_COOKIE, maxAge: 10 * 60 * 1000 }) // 10 minuti per fare il login su Google
    passport.authenticate('google', { // crea il middleware che fa il redirect a Google: si chiama qui perché lo state cambia ogni volta
        scope: ['profile', 'email'],
        session: false,
        state,
    })(request, response, next)
}

const googleLink = (request, response) => { // "Collega Google": l'autore loggato (verifyToken) salva chi è in un cookie, poi il frontend apre /auth/google?link=1
    response.cookie('googleLink', authService.createLinkToken(request.author), { ...GOOGLE_COOKIE, maxAge: 15 * 60 * 1000 }) // 15 minuti, più dello state: se su Google passa troppo tempo, scade prima lo state e non si crea un altro account
    response.status(204)
        .send() // nessun contenuto: serve solo il cookie
}

const googleCallback = (request, response) => {
    const accessToken = authService.createToken(request.user) // request.user è l'autore trovato, creato o collegato in google.strategy.js
    response.clearCookie('googleState', GOOGLE_COOKIE) // già controllato, non serve più
    response.clearCookie('googleLink', GOOGLE_COOKIE) // il collegamento, se c'era, è fatto
    response.cookie('googleToken', accessToken, { ...GOOGLE_COOKIE, maxAge: 60 * 1000 }) // 1 minuto: il frontend lo chiede subito con POST /auth/google/token
    response.redirect(`${process.env.FRONTEND_URL}/login?google=success`) // il token non è nell'indirizzo, quindi neanche nella cronologia o nei log
}

const googleToken = (request, response) => { // il frontend, appena tornato da Google, riceve il token salvato nel cookie dal callback
    const accessToken = request.cookies.googleToken
    if (!accessToken) {
        throw new HttpError(401, "Google login expired, please try again")
    }
    response.clearCookie('googleToken', GOOGLE_COOKIE) // si usa una volta sola
    response.status(200)
        .send({
            accessToken
        })
}

const googleError = (error, request, response, next) => { // 4 parametri: Express lo chiama solo se il login con Google lancia un errore (es: codice di Google scaduto)
    response.clearCookie('googleLink', GOOGLE_COOKIE) // il collegamento, se c'era, è finito anche se non è riuscito
    if (error instanceof HttpError && error.status === 409) { // conflitto con un altro autore (authService)
        const reason = request.cookies.googleLink ? 'google-linked' : 'google-email' // "Collega Google": l'account Google è già di un altro autore; login: l'email è già registrata con una password
        return response.redirect(`${process.env.FRONTEND_URL}/login?error=${reason}`)
    }
    console.error(error) // il motivo resta nel terminale
    response.redirect(`${process.env.FRONTEND_URL}/login?error=google`) // al posto della pagina JSON dell'errore, il login del frontend con un messaggio
}

module.exports = {
    login,
    me,
    googleLogin,
    googleLink,
    googleCallback,
    googleToken,
    googleError,
}
