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
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3e596; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/localite-waitlist/main/assets/logo.png" width="150">
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="color: #56684E;">You're on the list!</h1>
                        <p style="color: #444;">Thanks for joining Localite.</p>
                        <p style="font-size: 12px; color: #888; margin-top: 20px;">The Localite Team</p>
                    </div>
                </div>
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