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

// Prevent "OverwriteModelError" in serverless
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

// 3. Email Transporter (Using Brevo/Gmail settings)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // Your Brevo Login ID
        pass: process.env.EMAIL_PASS  // Your Brevo API Key
    }
});

// 4. The Main Function (Runs when user clicks Join)
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        await connectToDatabase();

        // Save to DB
        const newSub = new Subscriber({ email });
        await newSub.save();

        // Send Email
        await transporter.sendMail({
            from: `"Localite Team" <hi.localite@gmail.com>`, // Your Verified Sender
            to: email,
            subject: 'Welcome to Localite!',
            html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f3e596; color: #1a1a1a; text-align: center;">
                    <img src="https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/localite-waitlist/main/assets/logo.png" width="150" style="margin-bottom:20px;">
                    <div style="background: white; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #56684E;">You're on the list!</h1>
                        <p>Thanks for joining Localite.</p>
                    </div>
                </div>
            `
        });

        res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};