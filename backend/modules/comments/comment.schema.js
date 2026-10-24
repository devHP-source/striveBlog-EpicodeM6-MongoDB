const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({ // ogni commento riceve in automatico il suo _id
    text: {
        type: String,
        required: true
    },
    author: { // l'autore loggato che ha scritto il commento, con populate() arrivano i suoi dati
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
}, { timestamps: true })

module.exports = commentSchema // non è un model: i commenti sono salvati dentro BlogPost (embedding)
