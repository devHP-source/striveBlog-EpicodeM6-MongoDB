const express = require('express')
const BlogPost = require('../models/BlogPost')
const uploadCloudinary = require('../middlewares/uploadCloudinary')
const sendEmail = require('../utils/sendEmail')

const router = express.Router()

const AUTHOR_FIELDS = 'name surname email avatar' // i campi dell'autore che populate() mette nel post

// Express sends errors from async routes to the error handler in server.js

const isPostAuthor = async (request, response, next) => { // solo l'autore del post può modificarlo o cancellarlo
    const blogPost = await BlogPost.findById(request.params.id ?? request.params.blogPostId) // la route della cover usa :blogPostId
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    if (!blogPost.author.equals(request.author._id)) { // il post salva l'_id dell'autore, request.author arriva da verifyToken
        return response.status(403)
            .send({
                message: "You can only change your own posts"
            })
    }
    next()
}

router.get('/', async (request, response) => { // GET: /blogPosts?page=1&perPage=10&title=boh, lista dei post
    const page = Math.max(parseInt(request.query.page) || 1, 1) // almeno 1, con un numero negativo skip() va in errore
    const perPage = Math.min(Math.max(parseInt(request.query.perPage) || 10, 1), 100) // tra 1 e 100

    const filter = {}
    if (request.query.title) {
        filter.title = {
            $regex: request.query.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // escape dei caratteri speciali, es. "C++" o "("
            $options: 'i' 
        }
    }

    const [blogPosts, totalResults] = await Promise.all([ // le due query partono insieme
        BlogPost.find(filter)
            .sort({ createdAt: -1 }) // i più recenti per primi
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('author', AUTHOR_FIELDS), // sostituisce l'_id dell'autore con i suoi dati
        BlogPost.countDocuments(filter),
    ])

    response.status(200)
        .send({
            data: blogPosts,
            page,
            perPage,
            totalPages: Math.ceil(totalResults / perPage),
            totalResults,
        })
})

router.get('/:id', async (request, response) => { // GET: /blogPosts/:id, return uno specifico post
    const blogPost = await BlogPost.findById(request.params.id)
        .populate('author', AUTHOR_FIELDS)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    response.status(200)
        .send(blogPost)
})

router.post('/', async (request, response) => { // POST: /blogPosts, crea un nuovo post
    const blogPost = await BlogPost.create({
        ...request.body,
        author: request.author._id, // l'autore è l'utente del token, non si sceglie nel body
    })
    await sendEmail( // avvisa l'autore
        request.author.email,
        "Your post is published",
        `Your post "${blogPost.title}" has been published on Strive Blog.`
    )
    await blogPost.populate('author', AUTHOR_FIELDS) // sul documento già creato populate() si usa con await
    response.status(201)
        .send(blogPost)
})

router.put('/:id', isPostAuthor, async (request, response) => { // PUT: /blogPosts/:id, update uno specifico post
    delete request.body?.author // l'autore del post non si può cambiare
    const blogPost = await BlogPost.findByIdAndUpdate(request.params.id, request.body, {
        returnDocument: 'after', // send back the post after the update
        runValidators: true,
    })
        .populate('author', AUTHOR_FIELDS)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    response.status(200)
        .send(blogPost)
})

router.patch('/:blogPostId/cover', isPostAuthor, uploadCloudinary.single('cover'), async (request, response) => { // PATCH: /blogPosts/:blogPostId/cover, carica la cover su Cloudinary
    if (!request.file) {
        return response.status(400)
            .send({
                message: "No image uploaded, use the field 'cover'"
            })
    }
    const blogPost = await BlogPost.findByIdAndUpdate(request.params.blogPostId, { cover: request.file.path }, { // path è l'URL di Cloudinary
        returnDocument: 'after',
    })
        .populate('author', AUTHOR_FIELDS)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    response.status(200)
        .send(blogPost)
})

router.delete('/:id', isPostAuthor, async (request, response) => { // DELETE: /blogPosts/:id, cancella uno specifico post
    const blogPost = await BlogPost.findByIdAndDelete(request.params.id)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    response.status(200)
        .send(blogPost)
})

router.get('/:id/comments', async (request, response) => { // GET: /blogPosts/:id/comments, tutti i commenti di un post
    const blogPost = await BlogPost.findById(request.params.id)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    response.status(200)
        .send(blogPost.comments)
})

router.get('/:id/comments/:commentId', async (request, response) => { // GET: /blogPosts/:id/comments/:commentId, un commento di un post
    const blogPost = await BlogPost.findById(request.params.id)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    const comment = blogPost.comments.id(request.params.commentId) // cerca il commento per _id dentro l'array
    if (!comment) {
        return response.status(404)
            .send({
                message: "Comment not found"
            })
    }
    response.status(200)
        .send(comment)
})

router.post('/:id', async (request, response) => { // POST: /blogPosts/:id, aggiunge un commento al post
    const blogPost = await BlogPost.findById(request.params.id)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    blogPost.comments.push(request.body)
    await blogPost.save()
    response.status(201)
        .send(blogPost.comments[blogPost.comments.length - 1]) // il commento appena aggiunto
})

router.put('/:id/comment/:commentId', async (request, response) => { // PUT: /blogPosts/:id/comment/:commentId, modifica un commento
    const blogPost = await BlogPost.findById(request.params.id)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    const comment = blogPost.comments.id(request.params.commentId)
    if (!comment) {
        return response.status(404)
            .send({
                message: "Comment not found"
            })
    }
    comment.set(request.body)
    await blogPost.save()
    response.status(200)
        .send(comment)
})

router.delete('/:id/comment/:commentId', async (request, response) => { // DELETE: /blogPosts/:id/comment/:commentId, cancella un commento
    const blogPost = await BlogPost.findById(request.params.id)
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    const comment = blogPost.comments.id(request.params.commentId)
    if (!comment) {
        return response.status(404)
            .send({
                message: "Comment not found"
            })
    }
    comment.deleteOne() // lo toglie dall'array
    await blogPost.save()
    response.status(200)
        .send(comment)
})

module.exports = router
