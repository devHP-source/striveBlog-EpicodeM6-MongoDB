require('dotenv/config') // carica backend/.env in process.env, prima di tutto il resto
const checkEnv = require('./config/env')

checkEnv() // prima di caricare l'app: alcuni moduli leggono il .env appena vengono caricati

const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 9099

connectDB()
    .then(() => {
        app.listen(PORT, error => { // Express 5 passa qui anche l'errore, es. la porta è già usata
            if (error) {
                console.error(`Could not start the server on port ${PORT}:`, error.message)
                process.exit(1)
            }
            console.log(`Server is up and running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Could not connect to MongoDB Atlas:", error.message)
        process.exit(1) // senza database l'API non può funzionare
    })
