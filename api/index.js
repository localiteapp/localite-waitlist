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

// 3. Email Transporter (DIRECT GMAIL STRATEGY)
// We use Port 465 (SSL) which is faster and more secure for Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // TRUE for 465
    auth: {
        user: process.env.EMAIL_USER, // hi.localite@gmail.com
        pass: process.env.EMAIL_PASS  // Google App Password
    }
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        // Run DB connection and Email sending in PARALLEL to save time
        // This is the trick to beat the 10-second limit
        const dbPromise = connectToDatabase().then(() => {
            const newSub = new Subscriber({ email });
            return newSub.save();
        });

        const emailPromise = transporter.sendMail({
            from: `"Localite Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Localite!',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* Mobile Responsive Rules */
                @media only screen and (max-width: 600px) {
                    .container { width: 100% !important; }
                    .nav-link { display: block !important; padding: 10px !important; }
                }
            </style>
            </head>
            <body style="margin:0; padding:0; background-color:#F0F4F8; font-family: sans-serif;">

                <table role="presentation" class="container" width="600" align="center" border="0" cellpadding="0" cellspacing="0" style="background-color:#ffffff; margin: 0 auto;">
                    
                    <tr>
                        <td align="center" style="padding: 0;">
                            <a href="https://localiteapp.in">
                                <img src="https://raw.githubusercontent.com/YOUR_GITHUB_USER/localite-waitlist/main/assets/header.png" alt="Welcome to Localite" width="600" style="width: 100%; max-width: 600px; display: block; height: auto; border: 0;">
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #EBF3F5; padding: 15px;">
                            <a href="https://instagram.com/yourhandle" style="text-decoration: none; color: #56684E; font-size: 12px; margin: 0 10px; font-weight: bold;">INSTAGRAM</a>
                            <a href="#" style="text-decoration: none; color: #56684E; font-size: 12px; margin: 0 10px; font-weight: bold;">WHATSAPP</a>
                            <a href="#" style="text-decoration: none; color: #56684E; font-size: 12px; margin: 0 10px; font-weight: bold;">LINKEDIN</a>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px 40px; background-color: #EBF3F5; color: #333;">
                            <p style="font-size: 14px; line-height: 1.6; margin: 0;">
                                Thank you for joining us early.<br>
                                From familiar cafés to the latest brunch places, you'll always know where to go.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0; background-color: #EBF3F5;">
                            <img src="https://raw.githubusercontent.com/YOUR_GITHUB_USER/localite-waitlist/main/assets/grid.png" alt="Brunch, Bakery, Court, Bowling" width="600" style="width: 100%; max-width: 600px; display: block; height: auto;">
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0;">
                            <img src="https://raw.githubusercontent.com/YOUR_GITHUB_USER/localite-waitlist/main/assets/footer.png" alt="Coming Soon" width="600" style="width: 100%; max-width: 600px; display: block; height: auto;">
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px; background-color: #EBF3F5; font-size: 11px; color: #888;">
                            <p style="margin: 0;">If you no longer wish to receive these emails, you can</p>
                            <a href="https://localiteapp.in/api/unsubscribe?email=${email}" style="color: #56684E; text-decoration: underline;">Unsubscribe</a>
                        </td>
                    </tr>

                </table>

            </body>
            </html>
            `
        });

        // Wait for both to finish
        await Promise.all([dbPromise, emailPromise]);

        return res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};