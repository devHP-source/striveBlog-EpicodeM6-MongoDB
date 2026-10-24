const BlogPost = require('./blogPost.model')
const HttpError = require('../../utils/HttpError')

const isPostAuthor = async (request, response, next) => { // solo l'autore del post può modificarlo o cancellarlo
    const blogPost = await BlogPost.findById(request.params.id ?? request.params.blogPostId) // la route della cover usa :blogPostId
        .select('author') // serve solo l'autore, non tutti i commenti del post
    if (!blogPost) {
        throw new HttpError(404, "Blog post not found")
    }
    if (!blogPost.author.equals(request.author._id)) { // il post salva l'_id dell'autore, request.author arriva da verifyToken
        throw new HttpError(403, "You can only change your own posts")
    }
    next()
}

module.exports = {
    isPostAuthor,
}
