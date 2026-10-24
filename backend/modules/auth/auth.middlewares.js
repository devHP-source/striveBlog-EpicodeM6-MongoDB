const checkGoogleState = (request, response, next) => { // al ritorno da Google lo state deve essere quello del cookie: così il login è partito da questo browser
    const { googleState } = request.cookies // salvato da authController.googleLogin
    if (!googleState || googleState !== request.query.state) { // es: qualcuno manda il link del callback con il suo codice di Google
        return response.redirect(`${process.env.FRONTEND_URL}/login?error=google`)
    }
    next()
}

module.exports = {
    checkGoogleState,
}
