const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (to, subject, text) => {
    try {
        await sgMail.send({
            to,
            from: process.env.SENDGRID_SENDER,
            subject,
            text,
        })
    } catch (error) {
        console.error("Could not send the email:", error.response?.body ?? error.message) // SendGrid spiega il motivo nel body, l'autore o il post vengono creati lo stesso
    }
}

module.exports = sendEmail
