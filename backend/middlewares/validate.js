const { validationResult, matchedData } = require('express-validator')
const HttpError = require('../utils/HttpError')

const validate = rules => [ // es: validate(createAuthorRules): prima le regole, poi il controllo del risultato
    ...rules,
    (request, response, next) => {
        const result = validationResult(request)
        if (!result.isEmpty()) {
            const errors = result.array({ onlyFirstError: true }) // un errore per campo
                .map(error => ({ field: error.path, message: error.msg }))
            throw new HttpError(400, errors[0].message, errors) // il frontend mostra message, errors ha tutti i campi
        }
        request.body = matchedData(request, { locations: ['body'] }) // restano solo i campi con una regola, gli altri (es: googleId) spariscono
        next()
    },
]

module.exports = validate
