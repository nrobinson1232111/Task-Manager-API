const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'nrobinson1232111@gmail.com',
        subject: 'Thank for joining',
        text: `Welcome to the app ${name}. Let me know how you like the app`
    })
}

const sendLeavingEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'nrobinson1232111@gmail.com',
        subject: 'Sorry to see you go',
        text: `Goodbye ${name}. We appreciate having your business, but we respect your decision to delete your account.`
    })
}

module.exports = {
    sendWelcomeEmail: sendWelcomeEmail,
    sendLeavingEmail
}