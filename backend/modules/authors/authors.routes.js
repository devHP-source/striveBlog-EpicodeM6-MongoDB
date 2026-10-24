const express = require('express')
const verifyToken = require('../../middlewares/verifyToken')
const validate = require('../../middlewares/validate')
const upload = require('../../middlewares/upload')
const { isProfileOwner } = require('./authors.middlewares')
const { createAuthorRules, updateAuthorRules } = require('./authors.validators')
const authorsController = require('./authors.controller')

const router = express.Router()

router.get('/', verifyToken, authorsController.findAll) // lista paginata: ?page=1&perPage=10
router.get('/:id', verifyToken, authorsController.findOne)
router.get('/:id/blogPosts', verifyToken, authorsController.findBlogPosts) // tutti i post di un autore
router.post('/', validate(createAuthorRules), authorsController.create) // registrazione: senza token
router.put('/:id', verifyToken, isProfileOwner, validate(updateAuthorRules), authorsController.update)
router.patch('/:authorId/avatar', verifyToken, isProfileOwner, upload.single('avatar'), authorsController.uploadAvatar) // l'immagine va su Cloudinary
router.delete('/:id', verifyToken, isProfileOwner, authorsController.remove) // cancella anche i suoi post e i suoi commenti

module.exports = router
