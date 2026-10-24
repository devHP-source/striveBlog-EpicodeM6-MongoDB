const REQUIRED_VARIABLES = [ // senza queste il server non parte
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'FRONTEND_URL',
]

const checkEnv = () => {
    const missing = REQUIRED_VARIABLES.filter(name => !process.env[name])
    if (missing.length > 0) {
        console.error(`Missing in backend/.env: ${missing.join(', ')} (see backend/.env.example)`)
        process.exit(1)
    }
}

module.exports = checkEnv
