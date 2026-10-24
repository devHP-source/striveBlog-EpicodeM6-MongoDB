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
        required: function () { return !this.googleId } // Google non dà la data di nascita
    },
    avatar: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: function () { return !this.googleId } // chi entra con Google non ha una password
    },
    googleId: {
        type: String
    },
}, {
    timestamps: true, // aggiunge createdAt e updatedAt
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password // la password non viene mai mandata nelle risposte
            delete ret.googleId // l'id dell'account Google serve solo al backend
            return ret
        }
    }
})

authorSchema.pre('save', async function () { // prima di salvare, cripta la password
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

authorSchema.pre('findOneAndUpdate', async function () { // findByIdAndUpdate (PUT /authors/:id) non passa dal pre save: la nuova password si cripta qui
    const update = this.getUpdate()
    if (update.password) {
        this.setUpdate({
            ...update,
            password: await bcrypt.hash(update.password, 10),
        })
    }
})

module.exports = mongoose.model('Author', authorSchema)
