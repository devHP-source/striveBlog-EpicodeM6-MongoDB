const commentsService = require('./comments.service')

const findAll = async (request, response) => {
    const comments = await commentsService.findAll(request.params.id)
    response.status(200)
        .send(comments)
}

const findOne = async (request, response) => {
    const comment = await commentsService.findOne(request.params.id, request.params.commentId)
    response.status(200)
        .send(comment)
}

const create = async (request, response) => {
    const comment = await commentsService.create(request.params.id, request.author._id, request.body) // request.author arriva da verifyToken
    response.status(201)
        .send(comment)
}

const update = async (request, response) => {
    const comment = await commentsService.update(request.blogPost, request.params.commentId, request.body) // request.blogPost arriva da isCommentAuthor
    response.status(200)
        .send(comment)
}

const remove = async (request, response) => {
    const comment = await commentsService.remove(request.blogPost, request.params.commentId) // request.blogPost arriva da isCommentAuthor
    response.status(200)
        .send(comment)
}

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
}
