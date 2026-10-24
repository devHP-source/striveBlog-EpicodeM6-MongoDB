const mongoose = require('mongoose')

const connectDB = () => mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'strive-blog'
})

module.exports = connectDB
