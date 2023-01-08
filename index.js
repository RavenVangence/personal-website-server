const express = require('express');
const {google} = require('googleapis');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});


const app = express(); //Server initialized
app.listen(process.env.PORT || 5000, console.log('On port 5000')) //Port opening


app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.post('/contact', (req, res) => {
    const {name, email, message} = req.body;
    
    const sendMail = async () => {
        try {
            const accessToken = await oAuth2Client.getAccessToken();
            
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN,
                    accessToken: accessToken
                }
            })

            const mailOptions = {
                from: `${name} 📧 <${email}>`,
                to: process.env.EMAIL,
                subject: 'Message From NodeMailer ⚓',
                html: `<div>
                <h1>This Is a messsage from personal website form</h1>
                <h4>This is their email : ${email}</h4>
                <h5>From : ${name}</h5>
                        <p>${message}</p>
                    </div>`
            }

            const result = await transport.sendMail(mailOptions)
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    sendMail().then((result) => {
        console.log('email sent !!', result);
        res.end();
    }).catch(error => console.log(error))
})
