const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const verifyToken = require('./middlewares/verifyToken')
const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')
const authRoutes = require('./modules/auth/auth.routes')
const authorsRoutes = require('./modules/authors/authors.routes')
const blogPostsRoutes = require('./modules/blogPosts/blogPosts.routes')
const commentsRoutes = require('./modules/comments/comments.routes')

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })) // il browser accetta le risposte solo sul frontend (Bruno non usa CORS), credentials: anche con i cookie del login con Google
app.use(express.json())
app.use(cookieParser()) // i cookie della richiesta in request.cookies
app.use(passport.initialize())

app.get('/', verifyToken, (request, response) => {
    response.status(200)
        .send({
            message: "Welcome to Epi-StriveBlog"
        })
})

app.use('/', authRoutes) // POST /login, GET /me e il login con Google (/auth/google)
app.use('/authors', authorsRoutes) // il token è controllato dentro il router, POST /authors (registrazione) è libero
app.use('/blogPosts', verifyToken, blogPostsRoutes, commentsRoutes) // tutto richiede il token, i commenti sono dentro i post

app.use(notFound) // nessuna route ha risposto
app.use(errorHandler) // ogni errore lanciato nelle route arriva qui

module.exports = app
