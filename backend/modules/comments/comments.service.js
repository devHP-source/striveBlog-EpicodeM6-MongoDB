const BlogPost = require('../blogPosts/blogPost.model')
const HttpError = require('../../utils/HttpError')

const AUTHOR_FIELDS = 'name surname avatar' // i campi dell'autore che populate() mette nel commento

const findPost = async postId => { // i commenti sono dentro il post, quindi prima si cerca il post
    const blogPost = await BlogPost.findById(postId)
    if (!blogPost) {
        throw new HttpError(404, "Blog post not found")
    }
    return blogPost
}

const findComment = (blogPost, commentId) => {
    const comment = blogPost.comments.id(commentId) // cerca il commento per _id dentro l'array
    if (!comment) {
        throw new HttpError(404, "Comment not found")
    }
    return comment
}

const populateAuthor = async (blogPost, comment) => { // solo l'autore di questo commento, non quelli di tutti i commenti del post
    await blogPost.populate(`comments.${blogPost.comments.indexOf(comment)}.author`, AUTHOR_FIELDS) // es: "comments.2.author": Mongoose non fa populate() direttamente sul commento
    return comment
}

const findAll = async postId => {
    const blogPost = await findPost(postId)
    await blogPost.populate('comments.author', AUTHOR_FIELDS) // l'_id dell'autore di ogni commento diventa { name, surname, avatar }
    return blogPost.comments
}

const findOne = async (postId, commentId) => {
    const blogPost = await findPost(postId)
    return populateAuthor(blogPost, findComment(blogPost, commentId))
}

const create = async (postId, authorId, data) => {
    const blogPost = await findPost(postId)
    blogPost.comments.push({
        ...data,
        author: authorId, // l'autore è l'utente del token, non si sceglie nel body
    })
    await blogPost.save()
    return populateAuthor(blogPost, blogPost.comments[blogPost.comments.length - 1]) // il commento appena aggiunto
}

const update = async (blogPost, commentId, data) => { // blogPost è già caricato da isCommentAuthor
    const comment = findComment(blogPost, commentId)
    comment.set(data)
    await blogPost.save()
    return populateAuthor(blogPost, comment)
}

const remove = async (blogPost, commentId) => { // blogPost è già caricato da isCommentAuthor
    const comment = findComment(blogPost, commentId)
    await populateAuthor(blogPost, comment) // prima di toglierlo dall'array, così la risposta ha i dati dell'autore
    comment.deleteOne() // lo toglie dall'array
    await blogPost.save()
    return comment
}

const removeByAuthor = authorId => BlogPost.updateMany({ // quando un autore cancella il suo profilo, i suoi commenti spariscono dai post degli altri
    'comments.author': authorId
}, {
    $pull: { comments: { author: authorId } },
    $inc: { __v: 1 } // come comment.deleteOne(): i commenti cambiano posizione, così una modifica partita prima non scrive sul commento sbagliato
})

module.exports = {
    findPost,
    findComment,
    findAll,
    findOne,
    create,
    update,
    remove,
    removeByAuthor,
}
