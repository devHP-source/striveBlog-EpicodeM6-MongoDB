const HttpError = require('../../utils/HttpError')

const isProfileOwner = (request, response, next) => { // solo l'autore loggato può modificare o cancellare il suo profilo
    const id = request.params.id ?? request.params.authorId // la route dell'avatar usa :authorId
    if (id !== request.author.id) { // request.author arriva da verifyToken
        throw new HttpError(403, "You can only change your own profile")
    }
    next()
}

module.exports = {
    isProfileOwner,
}
