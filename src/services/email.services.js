const nodemailer = require("nodemailer");
const User = require("../models/user.models");

//Importing .env variables
const { APP_PORT, APP_PASSWORD, APP_EMAIL } = require("../config/env");

//creating transporter to setup email service 
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: APP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD
    }
});

const sendEmail = async (user, emailBody, subject) => {
    try {
        const mailOptions = {
            from: APP_EMAIL,
            to: user.email,
            subject: subject,
            html: emailBody
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("DEBUG: ", "Sending Email Error");
                console.log(error);
            }
            else {
                console.log("Email Sent: ", info)
            }
        })
    } catch (error) {
        console.log("Email sent Error, ", error);
    }
}
module.exports = { sendEmail }