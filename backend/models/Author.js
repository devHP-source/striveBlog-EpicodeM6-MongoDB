const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true },
    surname: { 
        type: String, 
        required: true },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true },
    dob: { 
        type: String, 
        required: true },
    avatar: { 
        type: String, 
        required: true },
})

module.exports = mongoose.model('Author', authorSchema)
