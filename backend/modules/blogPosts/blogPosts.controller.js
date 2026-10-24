const blogPostsService = require('./blogPosts.service')
const HttpError = require('../../utils/HttpError')
const { getPagination } = require('../../utils/pagination')

const findAll = async (request, response) => {
    const blogPosts = await blogPostsService.findAll(getPagination(request.query), request.query.title)
    response.status(200)
        .send(blogPosts)
}

const findOne = async (request, response) => {
    const blogPost = await blogPostsService.findById(request.params.id)
    response.status(200)
        .send(blogPost)
}

const create = async (request, response) => {
    const blogPost = await blogPostsService.create(request.author, request.body) // request.author arriva da verifyToken
    response.status(201)
        .send(blogPost)
}

const update = async (request, response) => {
    const blogPost = await blogPostsService.update(request.params.id, request.body) // l'autore e i commenti non sono nel body: li toglie validate()
    response.status(200)
        .send(blogPost)
}

const uploadCover = async (request, response) => {
    if (!request.file) {
        throw new HttpError(400, "No image uploaded, use the field 'cover'")
    }
    const blogPost = await blogPostsService.updateCover(request.params.blogPostId, request.file.path) // path è l'URL di Cloudinary
    response.status(200)
        .send(blogPost)
}

const remove = async (request, response) => {
    const blogPost = await blogPostsService.remove(request.params.id)
    response.status(200)
        .send(blogPost)
}

module.exports = {
    findAll,
    findOne,
    create,
    update,
    uploadCover,
    remove,
}
