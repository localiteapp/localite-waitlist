// api/index.js
require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// 1. Database Connection (Cached for speed)
let isConnected = false;
async function connectToDatabase() {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("✅ DB Connected");
    } catch (error) {
        console.error("❌ DB Connection Error:", error);
    }
}

// 2. Define Schema
const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

// 3. Email Transporter (DIRECT GMAIL SSL)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// 4. Main Function
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Run DB and Email in parallel for speed
        await connectToDatabase();
        const newSub = new Subscriber({ email });
        await newSub.save();

        // 5. Send The Email
        await transporter.sendMail({
            from: `"Localite Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Localite!',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Localite</title>
            <style>
                /* RESET STYLES */
                body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; }
                body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }
                img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
            </style>
            </head>
            <body style="background-color: #F0F4F8;">

                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        
                                        <img src="https://raw.githubusercontent.com/localiteapp/localite-waitlist/main/assets/newsletter-full.jpg" 
                                            alt="Welcome to Localite" 
                                            width="600"
                                            style="display: block; width: 100%; max-width: 600px; height: auto;">
                                            
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td align="center" style="padding: 20px; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #999999;">
                                        <p style="margin: 0;">No longer want these emails?</p>
                                        <a href="https://localiteapp.in/api/unsubscribe?email=${email}" style="color: #56684E; text-decoration: underline;">Unsubscribe</a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </body>
            </html>
            `
        });

        res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};