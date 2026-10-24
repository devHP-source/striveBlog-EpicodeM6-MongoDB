const jwt = require('jsonwebtoken')
const Author = require('../modules/authors/author.model')
const HttpError = require('../utils/HttpError')

const verifyToken = async (request, response, next) => {
    const token = request.headers.authorization?.replace('Bearer ', '') // header "Authorization: Bearer <token>"
    if (!token) {
        throw new HttpError(401, "Token missing, please login")
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET) // se il token non è valido o è scaduto lancia un errore (401 nell'errorHandler)
    const author = await Author.findById(payload.id)
    if (!author) {
        throw new HttpError(401, "The user of this token does not exist")
    }
    request.author = author // l'utente loggato, disponibile nelle route
    next()
}

module.exports = verifyToken
