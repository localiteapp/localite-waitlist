// api/unsubscribe.js
require('dotenv').config();
const mongoose = require('mongoose');
const url = require('url');

let isConnected = false;

async function connectToDatabase() {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
    } catch (error) {
        console.error("DB Error:", error);
    }
}

const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true },
});
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

module.exports = async (req, res) => {
    // 1. Get the email from the link (?email=user@gmail.com)
    const queryObject = url.parse(req.url, true).query;
    const emailToRemove = queryObject.email;

    if (!emailToRemove) {
        return res.status(400).send("No email specified.");
    }

    try {
        await connectToDatabase();
        
        // 2. Delete the user
        await Subscriber.findOneAndDelete({ email: emailToRemove });

        // 3. Show a "Goodbye" page
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #56684E;">Unsubscribed</h1>
                <p>You have been removed from the Localite waitlist.</p>
                <p>Sorry to see you go!</p>
            </div>
        `);
    } catch (error) {
        res.status(500).send("Server Error");
    }
};