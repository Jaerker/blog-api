const nodemailer = require('nodemailer');


const sendEmail = async (email, subject, text) => {
    console.log(process.env.MAILUSER);
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.MAILHOST,
            secure: true,
            auth:{
                user: process.env.MAILUSER,
                pass: process.env.MAILPASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to:email,
            subject: subject,
            html:text,
        });
        console.log("email sent succesfully");
        return true;
    }
    catch(e){
        console.log("Email not sent");
        console.log(e);
        return false;
    }
}

module.exports = sendEmail;