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

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) // trim: "a, b" nel .env non deve dare " b"

app.use(cors({ // il browser accetta le risposte solo da questi indirizzi (Bruno non usa CORS), credentials: anche con i cookie del login con Google
    origin: allowedOrigins,
    credentials: true
}))
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
