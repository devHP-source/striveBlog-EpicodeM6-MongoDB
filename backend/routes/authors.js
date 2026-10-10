const express = require('express')
const Author = require('../models/Author')

const router = express.Router()

// Express sends errors from async routes to the error handler in server.js

router.get('/', async (request, response) => { // GET: prende la lista dei autori
    const authors = await Author.find()
    response.status(200)
        .send(authors)
})

router.get('/:id', async (request, response) => { // GET: /authors/:id, return uno specifico autore
    const author = await Author.findById(request.params.id)
    if (!author) {
        return response.status(404)
            .send({ message: "Author not found" })
    }
    response.status(200)
    .send(author)
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

// DELETE /authors/:id => deletes the author with the associated id
router.delete('/:id', async (request, response) => {
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
