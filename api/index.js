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
// Prevent model overwrite error in serverless
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

// 3. Email Transporter (Using Direct Gmail SSL for speed)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Must be true for port 465
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
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
        // Connect to DB
        await connectToDatabase();
        
        // Save to Database
        // Use findOneAndUpdate with upsert to prevent duplicates without crashing
        await Subscriber.findOneAndUpdate(
            { email: email },
            { email: email },
            { upsert: true, new: true }
        );

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
            <style>
                /* Reset styles for consistent rendering */
                body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; }
                body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }
                img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }
            </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F0F4F8;">

                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 0 auto;">
                    
                    <!-- 1. THE MAIN DESIGN IMAGE -->
                    <tr>
                        <td align="center" style="padding: 0;">
                            <img src="https://raw.githubusercontent.com/localiteapp/localite-waitlist/main/assets/newsletter-full.jpg" 
                                 alt="Welcome to Localite" 
                                 width="600" 
                                 style="display: block; width: 100%; max-width: 600px; height: auto;">
                        </td>
                    </tr>

                    <!-- 2. SOCIAL MEDIA ICONS ROW (With Pista Green Background) -->
                    <tr>
                        <!-- CHANGED: background-color: #bef5cb (Pista Green) -->
                        <td align="center" style="padding: 15px 0 10px 0; background-color: #bef5cb;">
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <!-- Instagram -->
                                    <td style="padding: 0 15px;">
                                        <a href="https://www.instagram.com/localiteapp/" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" width="28" height="28" alt="Instagram" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- WhatsApp -->
                                    <td style="padding: 0 15px;">
                                        <a href="https://whatsapp.com/channel/0029VbBkHpiISTkOP5cOcH2u" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="28" height="28" alt="WhatsApp" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- Gmail -->
                                    <td style="padding: 0 15px;">
                                        <a href="mailto:hi.localite@gmail.com" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="28" height="28" alt="Gmail" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- Reddit -->
                                    <td style="padding: 0 15px;">
                                        <a href="https://www.reddit.com/u/localite_app/" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/52/52053.png" width="28" height="28" alt="Reddit" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- LinkedIn -->
                                    <td style="padding: 0 15px;">
                                        <a href="https://www.linkedin.com/company/localite-app/" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="28" height="28" alt="LinkedIn" style="display:block;">
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- 3. UNSUBSCRIBE FOOTER (Also Green background to match) -->
                    <tr>
                        <td align="center" style="padding: 10px 20px 30px 20px; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #555; background-color: #bef5cb;">
                            <p style="margin: 0 0 5px 0;">If you no longer wish to receive these emails you can</p>
                            <a href="https://localiteapp.in/api/unsubscribe?email=${email}" style="color: #333; text-decoration: underline;">Unsubscribe</a>
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
        res.status(500).json({ message: "Internal Server Error" });
    }
};