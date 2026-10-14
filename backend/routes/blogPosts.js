const express = require('express')
const BlogPost = require('../models/BlogPost')

const router = express.Router()

// Express sends errors from async routes to the error handler in server.js

router.get('/', async (request, response) => { // GET: /blogPosts?page=1&perPage=10&title=boh, lista dei post
    const page = parseInt(request.query.page) || 1
    const perPage = parseInt(request.query.perPage) || 10

    const filter = {}
    if (request.query.title) {
        filter.title = { 
            $regex: request.query.title, 
            $options: 'i' 
        }
    }

    const blogPosts = await BlogPost.find(filter)
        .sort({ createdAt: -1 }) // i più recenti per primi
        .skip((page - 1) * perPage)
        .limit(perPage)
    const totalResults = await BlogPost.countDocuments(filter)

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
    const blogPost = await BlogPost.create(request.body)
    response.status(201)
        .send(blogPost)
})

router.put('/:id', async (request, response) => { // PUT: /blogPosts/:id, update uno specifico post
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
