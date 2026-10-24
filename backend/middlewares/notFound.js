const HttpError = require('../utils/HttpError')

const notFound = (request, response) => { // nessuna route ha risposto: 404 in JSON invece della pagina HTML di Express
    throw new HttpError(404, `Route not found: ${request.method} ${request.path}`)
}

module.exports = notFound
