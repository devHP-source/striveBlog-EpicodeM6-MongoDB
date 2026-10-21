const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Author = require('../models/Author')
const verifyToken = require('../middlewares/verifyToken')

const router = express.Router()

router.post('/login', async (request, response) => { // POST: /login, return il token di accesso
    const { email, password } = request.body ?? {}
    if (typeof email !== 'string' || typeof password !== 'string') { // solo testo, es. { "$ne": null } troverebbe il primo autore
        return response.status(400)
            .send({
                message: "Email and password are required"
            })
    }
    const author = await Author.findOne({ email })
    if (!author || !(await bcrypt.compare(password, author.password))) { // confronta la password con quella criptata
        return response.status(401)
            .send({
                message: "Wrong email or password"
            })
    }
    const accessToken = jwt.sign({ id: author._id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // il token scade dopo un giorno
    })
    response.status(200)
        .send({
            accessToken
        })
})

router.get('/me', verifyToken, async (request, response) => { // GET: /me, return l'utente del token
    response.status(200)
        .send(request.author)
})

module.exports = router
