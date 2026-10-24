const express = require('express')
const passport = require('./google.strategy') // passport con la strategia di Google già registrata
const verifyToken = require('../../middlewares/verifyToken')
const validate = require('../../middlewares/validate')
const { checkGoogleState } = require('./auth.middlewares')
const { loginRules } = require('./auth.validators')
const authController = require('./auth.controller')

const router = express.Router()

router.post('/login', validate(loginRules), authController.login) // return il token di accesso
router.get('/me', verifyToken, authController.me) // return l'utente del token

router.get('/auth/google', authController.googleLogin) // porta l'utente alla pagina di login di Google (?link=1: per "Collega Google")
router.get('/auth/google/callback', checkGoogleState, passport.authenticate('google', { // Google rimanda qui dopo il login, prima si controlla lo state
    session: false, // niente sessione, uso il JWT
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`, // login annullato su Google o email non verificata
}), authController.googleCallback, authController.googleError) // googleError: se qualcosa si rompe, si torna comunque al login del frontend
router.post('/auth/google/token', authController.googleToken) // il frontend riceve il token salvato nel cookie dal callback
router.post('/auth/google/link', verifyToken, authController.googleLink) // "Collega Google": solo per l'autore loggato

module.exports = router
