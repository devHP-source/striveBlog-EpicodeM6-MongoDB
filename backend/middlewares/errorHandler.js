const mongoose = require('mongoose')
const multer = require('multer')
const HttpError = require('../utils/HttpError')

const errorHandler = (error, request, response, next) => { // ogni errore dell'API arriva qui e diventa una risposta { message }
    if (error instanceof HttpError) { // lanciato dai nostri service e middleware, es. 404 "Author not found"
        return response.status(error.status)
            .send({
                message: error.message,
                errors: error.errors, // c'è solo per la validazione: l'elenco dei campi non validi
            })
    }
    if (error instanceof mongoose.Error.CastError) { // es: /authors/123: il valore non si può convertire, di solito un _id non valido
        return response.status(400)
            .send({
                message: error.kind === 'ObjectId' ? "Invalid ID" : error.message
            })
    }
    if (error instanceof mongoose.Error.ValidationError) { // un campo richiesto dal model manca o non è valido
        return response.status(400)
            .send({
                message: error.message
            })
    }
    if (error instanceof multer.MulterError) { // upload: file troppo grande o nome del campo sbagliato
        return response.status(400)
            .send({
                message: error.code === 'LIMIT_UNEXPECTED_FILE' ? `Unexpected file field "${error.field}"` : error.message
            })
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') { // errori di jwt.verify
        return response.status(401)
            .send({
                message: "Invalid or expired token, please login again"
            })
    }
    if (error instanceof mongoose.Error.VersionError) { // il post è cambiato mentre lo salvavi, es. un commento cancellato nello stesso momento
        return response.status(409)
            .send({
                message: "The post was changed in the meantime, please try again"
            })
    }
    if (error.code === 11000) { // indice unique: l'unico è l'email dell'autore
        return response.status(409)
            .send({
                message: "Email already in use"
            })
    }
    if (error.expose) { // errori di express.json(), es: un JSON non valido: status e messaggio sono pensati per il client
        return response.status(error.status)
            .send({
                message: error.message
            })
    }
    console.error(error) // l'errore completo resta nel terminale
    response.status(500)
        .send({
            message: "Internal server error" // al client nessun dettaglio interno
        })
}

module.exports = errorHandler
