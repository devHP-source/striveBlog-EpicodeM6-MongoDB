const Author = require('./author.model')
const blogPostsService = require('../blogPosts/blogPosts.service')
const commentsService = require('../comments/comments.service')
const HttpError = require('../../utils/HttpError')
const sendEmail = require('../../utils/sendEmail')
const { toPage } = require('../../utils/pagination')

const findAll = async ({ page, perPage, skip }) => {
    const [authors, totalResults] = await Promise.all([ // le due query partono insieme
        Author.find()
            .sort({ name: 1 }) // in ordine alfabetico
            .skip(skip)
            .limit(perPage),
        Author.countDocuments(),
    ])
    return toPage(authors, totalResults, { page, perPage })
}

const findById = async id => {
    const author = await Author.findById(id)
    if (!author) {
        throw new HttpError(404, "Author not found")
    }
    return author
}

const findBlogPosts = async id => {
    const author = await findById(id) // 404 se l'autore non esiste
    return blogPostsService.findByAuthor(author._id)
}

const create = async data => { // la password viene criptata nel model (pre save)
    const author = await Author.create(data)
    await sendEmail( // email di benvenuto al nuovo autore
        author.email,
        "Welcome to Strive Blog",
        `Hi ${author.name}, welcome to Strive Blog! You can now publish your posts, by the way, this is a TEST email`
    )
    return author
}

const update = async (id, data) => { // se c'è una nuova password, la cripta il model (pre findOneAndUpdate)
    const author = await Author.findByIdAndUpdate(id, data, {
        returnDocument: 'after', // send back the author after the update
        runValidators: true,
    })
    if (!author) {
        throw new HttpError(404, "Author not found")
    }
    return author // i post salvano l'_id dell'autore, quindi se cambia l'email non c'è niente da aggiornare
}

const updateAvatar = async (id, avatar) => {
    const author = await Author.findByIdAndUpdate(id, { avatar }, {
        returnDocument: 'after',
    })
    if (!author) {
        throw new HttpError(404, "Author not found")
    }
    return author
}

const remove = async id => {
    const author = await Author.findByIdAndDelete(id)
    if (!author) {
        throw new HttpError(404, "Author not found")
    }
    await Promise.all([ // le due cancellazioni partono insieme
        blogPostsService.removeByAuthor(author._id), // cancella anche i suoi post, che resterebbero senza autore
        commentsService.removeByAuthor(author._id), // e i suoi commenti sui post degli altri
    ])
    return author
}

module.exports = {
    findAll,
    findById,
    findBlogPosts,
    create,
    update,
    updateAvatar,
    remove,
}
