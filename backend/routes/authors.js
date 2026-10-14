const express = require('express')
const mongoose = require('mongoose')
const Author = require('../models/Author')
const BlogPost = require('../models/BlogPost')

const router = express.Router()

// Express sends errors from async routes to the error handler in server.js

router.get('/', async (request, response) => { // GET: /authors?page=1&perPage=10, prende la lista dei autori
    const page = parseInt(request.query.page) || 1
    const perPage = parseInt(request.query.perPage) || 10

    const authors = await Author.find()
        .sort({ name: 1 }) // in ordine alfabetico
        .skip((page - 1) * perPage)
        .limit(perPage)
    const totalResults = await Author.countDocuments()

    response.status(200)
        .send({
            data: authors,
            page,
            perPage,
            totalPages: Math.ceil(totalResults / perPage),
            totalResults,
        })
})

router.get('/:id', async (request, response) => { // GET: /authors/:id, return uno specifico autore
    const { id } = request.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400)
            .send({
                message: "the ID is not valid"
            })
    }
    const author = await Author.findById(id)
    if (!author) {
        return response.status(404)
            .send({ 
                message: "Author not found" 
            })
    }
    response.status(200)
        .send(author)
})

router.get('/:id/blogPosts', async (request, response) => { // GET: /authors/:id/blogPosts, tutti i post di uno specifico autore
    const author = await Author.findById(request.params.id)
    if (!author) {
        return response.status(404)
            .send({
                message: "Author not found"
            })
    }
    const blogPosts = await BlogPost.find({ // i post salvano l'email dell'autore
        author: author.email 
    }) 
    
    response.status(200)
        .send(blogPosts)
})

router.post('/', async (request, response) => { // POST: /authors, crea un nuovo autore
    const author = await Author.create(request.body)
    response.status(201)
        .send(author)
})

router.put('/:id', async (request, response) => { // PUT: /authors/:id, update uno specifico autore
    const author = await Author.findByIdAndUpdate(request.params.id, request.body, {
        returnDocument: 'after', // send back the author after the update
        runValidators: true,
    })
    if (!author) {
        return response.status(404)
            .send({ 
                message: "Author not found" 
            })
    }
    response.status(200)
        .send(author)
})

router.delete('/:id', async (request, response) => { // DELETE: /authors/:id, cancella uno specifico autore
    const author = await Author.findByIdAndDelete(request.params.id)
    if (!author) {
        return response.status(404)
            .send({ 
                message: "Author not found" 
            })
    }
    response.status(200)
        .send(author)
})

module.exports = router
