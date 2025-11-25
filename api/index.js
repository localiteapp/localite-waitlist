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

// 3. Email Transporter (Using Direct Gmail SSL)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// 4. The Main Function
module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        await connectToDatabase();
        
        const newSub = new Subscriber({ email });
        await newSub.save();

        // 5. Send The Email with Image Map
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
            <style>
                body { margin: 0; padding: 0; }
                img { display: block; border: 0; }
            </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F0F4F8;">

                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff;">
                    <tr>
                        <td align="center" style="padding: 0;">
                            
                            <!-- 1. THE MAIN IMAGE -->
                            <!-- Linking to your specific GitHub username -->
                            <img src="https://raw.githubusercontent.com/localiteapp/localite-waitlist/main/assets/newsletter-full.jpg" 
                                 alt="Welcome to Localite" 
                                 width="100%" 
                                 style="display: block; width: 100%; height: auto;"
                                 usemap="#image-map">

                            <!-- 2. THE MAP (Your Provided Code) -->
                            <map name="image-map">
                                <area target="_blank" alt="Instagram" title="Instagram" href="https://www.instagram.com/localiteapp/?igsh=MTg3cjZjeWJnemh4Nw%3D%3D#" coords="953,208,1167,271" shape="rect">
                                <area target="_blank" alt="LinkedIn" title="LinkedIn" href="https://www.linkedin.com/company/localite-app/" coords="1887,210,2061,271" shape="rect">
                                <area target="_blank" alt="Reddit" title="Reddit" href="https://www.reddit.com/u/localite_app/s/rWYzp1KrMd" coords="1826,269,1685,215" shape="rect">
                                <area target="_blank" alt="Gmail" title="Gmail" href="mailto:hi.localite@gmail.com" coords="1500,212,1628,269" shape="rect">
                                <!-- Cleaned up WhatsApp link (removed extra text) -->
                                <area target="_blank" alt="WhatsApp" title="WhatsApp" href="https://whatsapp.com/channel/0029VbBkHpiISTkOP5cOcH2u" coords="1233,208,1443,271" shape="rect">
                            </map>

                        </td>
                    </tr>
                    
                    <!-- UNSUBSCRIBE FOOTER -->
                    <tr>
                        <td align="center" style="padding: 20px; font-family: sans-serif; font-size: 11px; color: #888; background-color: #F0F4F8;">
                            <p style="margin: 0;">If you no longer wish to receive these emails you can</p>
                            <a href="https://localiteapp.in/api/unsubscribe?email=${email}" style="color: #56684E; text-decoration: underline;">Unsubscribe</a>
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
        // Handle duplicate email error gracefully
        if (error.code === 11000) {
             res.status(200).json({ message: "Already subscribed" });
        } else {
             res.status(500).json({ message: "Server Error" });
        }
    }
};