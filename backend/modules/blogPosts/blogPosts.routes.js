const express = require('express')
const validate = require('../../middlewares/validate')
const upload = require('../../middlewares/upload')
const { isPostAuthor } = require('./blogPosts.middlewares')
const { createBlogPostRules, updateBlogPostRules } = require('./blogPosts.validators')
const blogPostsController = require('./blogPosts.controller')

const router = express.Router() // il token è già controllato in app.js per tutto /blogPosts

router.get('/', blogPostsController.findAll) // lista paginata: ?page=1&perPage=10&title=react
router.get('/:id', blogPostsController.findOne)
router.post('/', validate(createBlogPostRules), blogPostsController.create) // l'autore è l'utente del token
router.put('/:id', isPostAuthor, validate(updateBlogPostRules), blogPostsController.update)
router.patch('/:blogPostId/cover', isPostAuthor, upload.single('cover'), blogPostsController.uploadCover) // l'immagine va su Cloudinary
router.delete('/:id', isPostAuthor, blogPostsController.remove)

module.exports = router
