const BlogPost = require('./blogPost.model')
const HttpError = require('../../utils/HttpError')
const sendEmail = require('../../utils/sendEmail')
const { toPage } = require('../../utils/pagination')

const AUTHOR_FIELDS = 'name surname email avatar' // i campi dell'autore che populate() mette nel post

const findAll = async ({ page, perPage, skip }, title) => {
    const filter = {}
    if (typeof title === 'string' && title) { // ?title=a&title=b arriva come array
        filter.title = {
            $regex: title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // escape dei caratteri speciali, es. "C++" o "("
            $options: 'i'
        }
    }
    const [blogPosts, totalResults] = await Promise.all([ // le due query partono insieme
        BlogPost.find(filter)
            .sort({ createdAt: -1 }) // i più recenti per primi
            .skip(skip)
            .limit(perPage)
            .populate('author', AUTHOR_FIELDS), // sostituisce l'_id dell'autore con i suoi dati
        BlogPost.countDocuments(filter),
    ])
    return toPage(blogPosts, totalResults, { page, perPage })
}

const findById = async id => {
    const blogPost = await BlogPost.findById(id)
        .populate('author', AUTHOR_FIELDS)
    if (!blogPost) {
        throw new HttpError(404, "Blog post not found")
    }
    return blogPost
}

const findByAuthor = authorId => BlogPost.find({ author: authorId }) // i post salvano l'_id dell'autore
    .populate('author', AUTHOR_FIELDS)

const create = async (author, data) => {
    const blogPost = await BlogPost.create({
        ...data,
        author: author._id, // l'autore è l'utente del token, non si sceglie nel body
    })
    await sendEmail( // avvisa l'autore
        author.email,
        "Your post is published",
        `Your post "${blogPost.title}" has been published on Strive Blog.`
    )
    return blogPost.populate('author', AUTHOR_FIELDS) // sul documento già creato populate() restituisce una Promise
}

const update = async (id, { readTime, ...data }) => {
    if (readTime) { // "readTime.value" invece di readTime: { value }, altrimenti Mongo sostituisce tutto readTime e la unit sparisce
        for (const [key, value] of Object.entries(readTime)) {
            data[`readTime.${key}`] = value
        }
    }
    const blogPost = await BlogPost.findByIdAndUpdate(id, data, {
        returnDocument: 'after', // send back the post after the update
        runValidators: true,
    })
        .populate('author', AUTHOR_FIELDS)
    if (!blogPost) {
        throw new HttpError(404, "Blog post not found")
    }
    return blogPost
}

const updateCover = async (id, cover) => {
    const blogPost = await BlogPost.findByIdAndUpdate(id, { cover }, {
        returnDocument: 'after',
    })
        .populate('author', AUTHOR_FIELDS)
    if (!blogPost) {
        throw new HttpError(404, "Blog post not found")
    }
    return blogPost
}

const remove = async id => {
    const blogPost = await BlogPost.findByIdAndDelete(id)
    if (!blogPost) {
        throw new HttpError(404, "Blog post not found")
    }
    return blogPost
}

const removeByAuthor = authorId => BlogPost.deleteMany({ // quando un autore cancella il suo profilo
    author: authorId
})

module.exports = {
    findAll,
    findById,
    findByAuthor,
    create,
    update,
    updateCover,
    remove,
    removeByAuthor,
}
