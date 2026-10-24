const authorsService = require('./authors.service')
const HttpError = require('../../utils/HttpError')
const { getPagination } = require('../../utils/pagination')

const findAll = async (request, response) => {
    const authors = await authorsService.findAll(getPagination(request.query))
    response.status(200)
        .send(authors)
}

const findOne = async (request, response) => {
    const author = await authorsService.findById(request.params.id) // un ID non valido diventa 400 "Invalid ID" nell'errorHandler
    response.status(200)
        .send(author)
}

const findBlogPosts = async (request, response) => {
    const blogPosts = await authorsService.findBlogPosts(request.params.id)
    response.status(200)
        .send(blogPosts)
}

const create = async (request, response) => {
    const author = await authorsService.create(request.body)
    response.status(201)
        .send(author)
}

const update = async (request, response) => {
    const author = await authorsService.update(request.params.id, request.body)
    response.status(200)
        .send(author)
}

const uploadAvatar = async (request, response) => {
    if (!request.file) {
        throw new HttpError(400, "No image uploaded, use the field 'avatar'")
    }
    const author = await authorsService.updateAvatar(request.params.authorId, request.file.path) // path è l'URL di Cloudinary
    response.status(200)
        .send(author)
}

const remove = async (request, response) => {
    const author = await authorsService.remove(request.params.id)
    response.status(200)
        .send(author)
}

module.exports = {
    findAll,
    findOne,
    findBlogPosts,
    create,
    update,
    uploadAvatar,
    remove,
}
