require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serves your HTML/CSS/JS files from the current folder
app.use(express.static(__dirname));

// --- 1. Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- 2. Define the Schema ---
const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// --- 3. Email Configuration ---
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Brevo's Server
    port: 2525,                    // The Magic Port (Works on Render)
    secure: false,                 // Must be false for port 2525
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- 4. The Route ---
app.post('/join-waitlist', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // A. Save to Database
        const newSub = new Subscriber({ email });
        await newSub.save();
        console.log(`New User: ${email}`);

        // B. Send Email
        const mailOptions = {
            // ⚠️ This email MUST be the one you just verified in Brevo
            from: `"Localite Team" <hi.localite@gmail.com>`, 
            to: email,
            subject: 'Welcome to Localite!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #56684E;">You are on the list!</h1>
                    <p>Thanks for joining <strong>Localite</strong>.</p>
                    <p>We will notify you as soon as we launch.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});