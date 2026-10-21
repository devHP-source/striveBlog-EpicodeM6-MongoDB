const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const authorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    surname: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true 
    },
    dob: { 
        type: String, 
        required: true 
    },
    avatar: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
}, {
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password // la password non viene mai mandata nelle risposte
            return ret
        }
    }
})

authorSchema.pre('save', async function () { // prima di salvare, cripta la password
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

module.exports = mongoose.model('Author', authorSchema)
