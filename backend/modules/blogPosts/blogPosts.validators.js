const { body } = require('express-validator')

const blogPostFields = { // funzioni: ogni chiamata crea una regola nuova, così create e update non la condividono
    category: () => body('category').trim().notEmpty().withMessage("Category is required"),
    title: () => body('title').trim().notEmpty().withMessage("Title is required"),
    cover: () => body('cover').isURL().withMessage("Cover must be a URL"),
    readTimeValue: () => body('readTime.value').isFloat({ gt: 0 }).withMessage("Read time must be a number greater than 0").toFloat(),
    readTimeUnit: () => body('readTime.unit').trim().notEmpty().withMessage("Read time unit is required"),
    content: () => body('content').notEmpty().withMessage("Content is required"),
}

const createBlogPostRules = Object.values(blogPostFields).map(rule => rule()) // nuovo post: tutti i campi obbligatori, l'autore arriva dal token
const updateBlogPostRules = Object.values(blogPostFields).map(rule => rule().optional()) // PUT: solo i campi da cambiare

module.exports = {
    createBlogPostRules,
    updateBlogPostRules,
}
