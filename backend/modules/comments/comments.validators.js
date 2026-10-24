const { body } = require('express-validator')

const commentRules = [ // solo il testo: l'autore arriva dal token
    body('text').trim().notEmpty().withMessage("Text is required"),
]

module.exports = {
    commentRules,
}
