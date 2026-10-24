const { body } = require('express-validator')

const loginRules = [
    body(['email', 'password'], "Email and password are required") // solo testo, es: { "$ne": null } troverebbe il primo autore
        .isString()
        .bail()
        .notEmpty(),
]

module.exports = {
    loginRules,
}
