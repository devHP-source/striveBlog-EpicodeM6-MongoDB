const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({ // ogni commento riceve in automatico il suo _id
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
}, { timestamps: true })

const blogPostSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    },
    readTime: {
        value: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        },
    },
    author: { // referencing: salva solo l'_id dell'autore, con populate() arrivano i suoi dati
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    comments: [commentSchema], // embedding: i commenti sono salvati dentro il post
}, { timestamps: true }) // aggiunge createdAt e updatedAt

module.exports = mongoose.model('BlogPost', blogPostSchema)
