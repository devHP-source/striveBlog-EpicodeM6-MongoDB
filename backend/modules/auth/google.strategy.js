const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const authService = require('./auth.service')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // es: http://localhost:9099/auth/google/callback
    passReqToCallback: true, // la funzione qui sotto riceve anche la request, per leggere il cookie di "Collega Google"
}, async (request, accessToken, refreshToken, profile, done) => { // Google ha confermato l'utente
    try {
        const { googleLink } = request.cookies // c'è solo se l'autore loggato ha cliccato "Collega Google"
        const author = googleLink
            ? await authService.linkGoogleAuthor(googleLink, profile)
            : await authService.findOrCreateGoogleAuthor(profile)
        done(null, author || false) // false: login fallito, failureRedirect riporta al login del frontend
    } catch (error) {
        done(error)
    }
}))

module.exports = passport
