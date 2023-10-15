const nodemailer = require("nodemailer");

const sendResetPasswordEmail = (email, generatedLink) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
    });

    let mailOptions = {
        from: "tsanvil2023@gmail.com",
        to: email,
        subject: "ANVIL - reset your password",
        text: `Reset your password with the following link: ${generatedLink} \n\n Note: This link will expire in 10 minutes`,
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
        } else {
            console.log("Email sent successfully");
        }
    });
};

const sendAccountActivationEmail = (email, generatedLink) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
    });

    let mailOptions = {
        from: "tsanvil2023@gmail.com",
        to: email,
        subject: "ANVIL - confirm your account",
        text: `Confirm your account with the following link: ${generatedLink} \n\n Note: This link will expire in 24 hours and your account wil be LOST!`,
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
        } else {
            console.log("Email sent successfully");
        }
    });
};

module.exports.sendResetPasswordEmail = sendResetPasswordEmail;
module.exports.sendAccountActivationEmail = sendAccountActivationEmail;
