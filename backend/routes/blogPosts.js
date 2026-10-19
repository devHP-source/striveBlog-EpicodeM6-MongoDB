const express = require('express')
const Author = require('../models/Author')
const BlogPost = require('../models/BlogPost')
const uploadCloudinary = require('../middlewares/uploadCloudinary')
const sendEmail = require('../utils/sendEmail')

const router = express.Router()

// Express sends errors from async routes to the error handler in server.js

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
            .limit(perPage),
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
    const authorExists = await Author.exists({ email: request.body?.author }) // il post deve appartenere a un autore esistente
    if (!authorExists) {
        return response.status(400)
            .send({
                message: "No author with this email"
            })
    }
    const blogPost = await BlogPost.create(request.body)
    await sendEmail( // avvisa l'autore, il campo author è la sua email
        blogPost.author,
        "Your post is published",
        `Your post "${blogPost.title}" has been published on Strive Blog.`
    )
    response.status(201)
        .send(blogPost)
})

router.put('/:id', async (request, response) => { // PUT: /blogPosts/:id, update uno specifico post
    if (request.body?.author) { // se si cambia l'autore, deve esistere
        const authorExists = await Author.exists({ email: request.body.author })
        if (!authorExists) {
            return response.status(400)
                .send({
                    message: "No author with this email"
                })
        }
    }
    const blogPost = await BlogPost.findByIdAndUpdate(request.params.id, request.body, {
        returnDocument: 'after', // send back the post after the update
        runValidators: true,
    })
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    response.status(200)
        .send(blogPost)
})

router.patch('/:blogPostId/cover', uploadCloudinary.single('cover'), async (request, response) => { // PATCH: /blogPosts/:blogPostId/cover, carica la cover su Cloudinary
    if (!request.file) {
        return response.status(400)
            .send({
                message: "No image uploaded, use the field 'cover'"
            })
    }
    const blogPost = await BlogPost.findByIdAndUpdate(request.params.blogPostId, { cover: request.file.path }, { // path è l'URL di Cloudinary
        returnDocument: 'after',
    })
    if (!blogPost) {
        return response.status(404)
            .send({
                message: "Blog post not found"
            })
    }
    response.status(200)
        .send(blogPost)
})

router.delete('/:id', async (request, response) => { // DELETE: /blogPosts/:id, cancella uno specifico post
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

module.exports = router
