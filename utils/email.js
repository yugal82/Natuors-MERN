const { htmlToText } = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        // if (process.env.NODE_ENV === 'production') {
        //     // sendgrid email
        //     return 1;
        // }

        // return transporter = nodemailer.createTransport({
        //     host: process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     auth: {
        //         user: process.env.EMAIL_USERNAME,
        //         pass: process.env.EMAIL_PASSWORD
        //     }
        // });

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD
            }
          });
    }

    // send the actual mail
    async send(template, subject) {
        // 1. Render the HTML based on a pug template 
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: subject
        });

        // 2. Mail options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText(html)
        };

        // 3. Create a transport and send mail
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('Welcome', 'Welcome to the BookMyTour family!'); 
    }

    async sendPasswordReset() {
        await this.send('resetPassword', 'Your password reset token (valid for only 10 mins)')
    }
}


// ----------------------------------------------------------------------------------------------------
// const sendEmail = async options => {
//     // this transporter is for gmail services but using gmail services is not recemmended for production
//     // const transporter = nodemailer.createTransport({
//     //     service: 'Gmail',
//     //     auth: {
//     //         user: process.env.EMAIL_USERNAME,
//     //         pass: process.env.EMAIL_PASSWORD
//     //     }
//     //     // activate in gmail 'less secure app' option
//     // })
//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });

//     // 2) Define the email options
//     const mailOptions = {
//         from: 'Jonas Schmedtmann <hello@jonas.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         // html:
//     };

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);
// };
