const jwt = require('jsonwebtoken')
const Author = require('../models/Author')

const verifyToken = async (request, response, next) => {
    const token = request.headers.authorization?.replace('Bearer ', '') // header "Authorization: Bearer <token>"
    if (!token) {
        return response.status(401)
            .send({
                message: "Token missing, please login"
            })
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET) // se il token non è valido o è scaduto lancia un errore (401 in server.js)
    const author = await Author.findById(payload.id)
    if (!author) {
        return response.status(401)
            .send({
                message: "The user of this token does not exist"
            })
    }
    request.author = author // l'utente loggato, disponibile nelle route
    next()
}

module.exports = verifyToken
