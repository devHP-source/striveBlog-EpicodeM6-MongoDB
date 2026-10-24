const { body } = require('express-validator')

const authorFields = { // funzioni: ogni chiamata crea una regola nuova, così create e update non la condividono
    name: () => body('name').trim().notEmpty().withMessage("Name is required"),
    surname: () => body('surname').trim().notEmpty().withMessage("Surname is required"),
    email: () => body('email').trim().isEmail().withMessage("Email is not valid"),
    dob: () => body('dob').isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage("Date of birth must be a date like 1990-12-31"),
    avatar: () => body('avatar').isURL().withMessage("Avatar must be a URL"),
    password: () => body('password', "Password must be at least 8 characters").isString().isLength({ min: 8 }), // isString: un numero arriverebbe a bcrypt così com'è e lo farebbe crashare (500)
}

const createAuthorRules = Object.values(authorFields).map(rule => rule()) // registrazione: tutti i campi obbligatori
const updateAuthorRules = Object.values(authorFields).map(rule => rule().optional()) // PUT: solo i campi da cambiare

module.exports = {
    createAuthorRules,
    updateAuthorRules,
}
