// ... inside your module.exports function ...

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
                /* Reset styles */
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

                    <!-- 2. SOCIAL MEDIA ICONS ROW -->
                    <tr>
                        <td align="center" style="padding: 20px 0 10px 0; background-color: #ffffff;">
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <!-- Instagram -->
                                    <td style="padding: 0 10px;">
                                        <a href="https://www.instagram.com/localiteapp/" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" width="24" height="24" alt="Instagram" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- WhatsApp -->
                                    <td style="padding: 0 10px;">
                                        <a href="https://whatsapp.com/channel/0029VbBkHpiISTkOP5cOcH2u" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24" height="24" alt="WhatsApp" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- Gmail -->
                                    <td style="padding: 0 10px;">
                                        <a href="mailto:hi.localite@gmail.com" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="24" height="24" alt="Gmail" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- Reddit -->
                                    <td style="padding: 0 10px;">
                                        <a href="https://www.reddit.com/u/localite_app/" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111589.png" width="24" height="24" alt="Reddit" style="display:block;">
                                        </a>
                                    </td>
                                    <!-- LinkedIn -->
                                    <td style="padding: 0 10px;">
                                        <a href="https://www.linkedin.com/company/localite-app/" target="_blank">
                                            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="24" height="24" alt="LinkedIn" style="display:block;">
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- 3. UNSUBSCRIBE FOOTER -->
                    <tr>
                        <td align="center" style="padding: 10px 20px 30px 20px; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #888; background-color: #ffffff;">
                            <p style="margin: 0 0 5px 0;">If you no longer wish to receive these emails you can</p>
                            <a href="https://localiteapp.in/api/unsubscribe?email=${email}" style="color: #56684E; text-decoration: underline;">Unsubscribe</a>
                        </td>
                    </tr>
                </table>

            </body>
            </html>
            `
        });
// ... rest of your code