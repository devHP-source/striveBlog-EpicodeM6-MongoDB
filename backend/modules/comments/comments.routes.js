const express = require('express')
const validate = require('../../middlewares/validate')
const { isCommentAuthor } = require('./comments.middlewares')
const { commentRules } = require('./comments.validators')
const commentsController = require('./comments.controller')

const router = express.Router() // montato su /blogPosts in app.js, dopo le route dei post

router.get('/:id/comments', commentsController.findAll) // tutti i commenti di un post
router.get('/:id/comments/:commentId', commentsController.findOne)
router.post('/:id', validate(commentRules), commentsController.create) // aggiunge un commento, l'autore è l'utente del token
router.put('/:id/comment/:commentId', isCommentAuthor, validate(commentRules), commentsController.update)
router.delete('/:id/comment/:commentId', isCommentAuthor, commentsController.remove)

module.exports = router
