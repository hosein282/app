const nodemailer = require('nodemailer');


// تنظیمات Nodemailer
const transporter = nodemailer.createTransport({

    host: 'smtp.zoho.com', 
    port: 587,
    secure : true,
    
    auth: {
        user: 'onkprod8@zohomail.com',
        pass: 'At9127995883'
    },
});

module.exports = transporter; // Export the MqttHelper class

