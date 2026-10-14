const mongoose = require('mongoose')

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
    author: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    content: { 
        type: String,
        required: true
    },
}, { timestamps: true }) // aggiunge createdAt e updatedAt

module.exports = mongoose.model('BlogPost', blogPostSchema)
