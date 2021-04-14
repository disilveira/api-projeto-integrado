const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 587,
            secure: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: `Projeto Integrado - PUC Minas <${process.env.FROM_EMAIL}>`,
            to: email,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            }
            console.log(info);
        })


    } catch (error) {
        console.log(error);
    }
};

module.exports = sendEmail;