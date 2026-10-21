const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Author = require('../models/Author')
const BlogPost = require('../models/BlogPost')
const uploadCloudinary = require('../middlewares/uploadCloudinary')
const verifyToken = require('../middlewares/verifyToken')
const sendEmail = require('../utils/sendEmail')

const router = express.Router()

// Express sends errors from async routes to the error handler in server.js

const isMe = (request, response, next) => { // solo l'autore loggato può modificare o cancellare il suo profilo
    const id = request.params.id ?? request.params.authorId // la route dell'avatar usa :authorId
    if (id !== request.author.id) { // request.author arriva da verifyToken
        return response.status(403)
            .send({
                message: "You can only change your own profile"
            })
    }
    next()
}

router.get('/', verifyToken, async (request, response) => { // GET: /authors?page=1&perPage=10, prende la lista dei autori
    const page = Math.max(parseInt(request.query.page) || 1, 1) // almeno 1, con un numero negativo skip() va in errore
    const perPage = Math.min(Math.max(parseInt(request.query.perPage) || 10, 1), 100) // tra 1 e 100

    const [authors, totalResults] = await Promise.all([ // le due query partono insieme
        Author.find()
            .sort({ name: 1 }) // in ordine alfabetico
            .skip((page - 1) * perPage)
            .limit(perPage),
        Author.countDocuments(),
    ])

    response.status(200)
        .send({
            data: authors,
            page,
            perPage,
            totalPages: Math.ceil(totalResults / perPage),
            totalResults,
        })
})

router.get('/:id', verifyToken, async (request, response) => { // GET: /authors/:id, return uno specifico autore
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

router.get('/:id/blogPosts', verifyToken, async (request, response) => { // GET: /authors/:id/blogPosts, tutti i post di uno specifico autore
    const author = await Author.findById(request.params.id)
    if (!author) {
        return response.status(404)
            .send({
                message: "Author not found"
            })
    }
    const blogPosts = await BlogPost.find({ // i post salvano l'_id dell'autore
        author: author._id
    })
        .populate('author', 'name surname email avatar') // come in /blogPosts, author arriva con i suoi dati

    response.status(200)
        .send(blogPosts)
})

router.post('/', async (request, response) => { // POST: /authors, crea un nuovo autore (registrazione, senza token)
    const author = await Author.create(request.body) // la password viene criptata nel model (pre save)
    await sendEmail( // email di benvenuto al nuovo autore
        author.email,
        "Welcome to Strive Blog",
        `Hi ${author.name}, welcome to Strive Blog! You can now publish your posts, by the way, this is a TEST email`
    )
    response.status(201)
        .send(author)
})

router.put('/:id', verifyToken, isMe, async (request, response) => { // PUT: /authors/:id, update uno specifico autore
    if (request.body?.password) { // findByIdAndUpdate non passa dal pre save, quindi la nuova password va criptata qui
        request.body.password = await bcrypt.hash(request.body.password, 10)
    }
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
    response.status(200) // i post salvano l'_id dell'autore, quindi se cambia l'email non c'è niente da aggiornare
        .send(author)
})

router.patch('/:authorId/avatar', verifyToken, isMe, uploadCloudinary.single('avatar'), async (request, response) => { // PATCH: /authors/:authorId/avatar, carica l'avatar su Cloudinary
    if (!request.file) {
        return response.status(400)
            .send({
                message: "No image uploaded, use the field 'avatar'"
            })
    }
    const author = await Author.findByIdAndUpdate(request.params.authorId, { avatar: request.file.path }, { // path è l'URL di Cloudinary
        returnDocument: 'after',
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

router.delete('/:id', verifyToken, isMe, async (request, response) => { // DELETE: /authors/:id, cancella uno specifico autore
    const author = await Author.findByIdAndDelete(request.params.id)
    if (!author) {
        return response.status(404)
            .send({
                message: "Author not found"
            })
    }
    await BlogPost.deleteMany({ // cancella anche i suoi post, che resterebbero senza autore
        author: author._id
    })
    response.status(200)
        .send(author)
})

module.exports = router
