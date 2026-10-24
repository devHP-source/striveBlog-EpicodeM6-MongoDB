const commentsService = require('./comments.service')
const HttpError = require('../../utils/HttpError')

const isCommentAuthor = async (request, response, next) => { // solo l'autore del commento può modificarlo o cancellarlo
    const blogPost = await commentsService.findPost(request.params.id)
    const comment = commentsService.findComment(blogPost, request.params.commentId)
    if (!comment.author.equals(request.author._id)) { // il commento salva l'_id dell'autore, request.author arriva da verifyToken
        throw new HttpError(403, "You can only change your own comments")
    }
    request.blogPost = blogPost // il post già caricato: il service lo usa senza cercarlo di nuovo
    next()
}

module.exports = {
    isCommentAuthor,
}
