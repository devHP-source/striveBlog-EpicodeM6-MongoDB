require('dotenv/config')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth')
const authorsRouter = require('./routes/authors')
const blogPostsRouter = require('./routes/blogPosts')
const verifyToken = require('./middlewares/verifyToken')

const PORT = process.env.PORT || 9099

const server = express()

server.use(cors())
server.use(express.json())

server.get('/', verifyToken, (request, response) => {
    response.status(200)
        .send({
            message: "Welcome to Epi-StriveBlog"
        })
})

server.use('/', authRouter) // POST /login e GET /me
server.use('/authors', authorsRouter) // il token è controllato dentro il router, POST /authors (registrazione) è libero
server.use('/blogPosts', verifyToken, blogPostsRouter) // tutte le route dei post richiedono il token


server.use((error, request, response, next) => {
    if (error.name === 'CastError' || error.name === 'ValidationError') {
        return response.status(400)
        .send({ 
            message: error.message
        })
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') { // errori di jwt.verify
        return response.status(401)
            .send({
                message: "Invalid or expired token, please login again"
            })
    }
    if (error.code === 11000) {
        return response.status(409)
            .send({ 
                message: "Email already in use" 
            })
    }
    console.error(error)
    response.status(error.status || 500)
        .send({ 
            message: error.message 
        })
})

mongoose.connect(process.env.MONGODB_URI, { 
    dbName: 'strive-blog' 
})
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is up and running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Could not connect to MongoDB Atlas:", error.message)
    })
