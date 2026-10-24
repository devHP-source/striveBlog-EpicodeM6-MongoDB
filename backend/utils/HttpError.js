class HttpError extends Error { // un errore con lo status HTTP, l'errorHandler lo trasforma nella risposta
    constructor(status, message, errors) {
        super(message)
        this.status = status
        this.errors = errors // l'elenco dei campi non validi
    }
}

module.exports = HttpError
