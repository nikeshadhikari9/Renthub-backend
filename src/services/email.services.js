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
const resetEmailBody = (user) => {
    return `<div
    style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); font-family: 'Arial', sans-serif;">
    <div style="background: linear-gradient(135deg, #6b46c1, #4f46e5); padding: 25px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
            <!--Here goess logo-->
            <span style="display: inline-block; vertical-align: middle;">Rent Hub</span>
        </h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 16px;">Your Trusted Rental Platform
        </p>
    </div>

    <!-- Email Body -->
    <div style="padding: 30px;">
        <p style="font-size: 16px; color: #4a5568; margin-bottom: 20px;">
            Hello, <strong style="color: #2d3748;">${user.fullName}</strong>
        </p>

        <p style="font-size: 16px; color: #4a5568; line-height: 1.5;">
            You requested to reset your Rent Hub password. Use the code below to verify your identity:
        </p>

        <!-- Token Box -->
        <div
            style="background: #f8fafc; border: 1px dashed #cbd5e0; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #6b46c1; margin: 10px 0;">
                ${user.token}
            </div>
            <div style="font-size: 14px; color: #718096;">
                Valid for 5 minutes only
            </div>
        </div>
        <p style="font-size: 15px; color: #4a5568; line-height: 1.5;">
            <span style="display: inline-block; width: 20px;">⚠️</span>
            <strong>Important:</strong> Never share this code with anyone.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #edf2f7;">
            <p style="font-size: 14px; color: #718096; margin: 5px 0;">
                If you didn't request this, please secure your account.
            </p>
            <p style="font-size: 14px; color: #718096; margin: 5px 0;">
                Need help? <a href="mailto:support@renthub.com" style="color: #4f46e5; text-decoration: none;">Contact
                    our support team</a>.
            </p>
        </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096;">
        © ${new Date().getFullYear()} Rent Hub. All rights reserved.<br>
        <span style="font-size: 11px;">Kachankawal-2, Jhapa, Nepal</span>
    </div>
</div>`
}

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
module.exports ={sendEmail, resetEmailBody}