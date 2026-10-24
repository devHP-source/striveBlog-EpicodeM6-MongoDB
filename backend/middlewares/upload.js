const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')
const HttpError = require('../utils/HttpError')

const MAX_SIZE_MB = 5

const storage = new CloudinaryStorage({ // multer manda il file direttamente a Cloudinary
    cloudinary,
    params: {
        folder: 'strive-blog',
    },
})

const upload = multer({ // dopo l'upload, request.file.path è l'URL dell'immagine
    storage,
    limits: {
        fileSize: MAX_SIZE_MB * 1024 * 1024, // oltre il limite multer risponde "File too large" (400)
    },
    fileFilter: (request, file, callback) => { // solo immagini, es:s image/png o image/jpeg
        if (!file.mimetype.startsWith('image/')) {
            return callback(new HttpError(400, "Only image files are allowed"))
        }
        callback(null, true)
    },
})

module.exports = upload
