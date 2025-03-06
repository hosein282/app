const express = require('express');

const { default: mqtt } = require('mqtt');
const userRoutes = require('./routes/userRoutes.js');
const resetPassword = require('./routes/resetPassword.js');
const deviceRoutes = require('./routes/deviceRoutes.js');
const updateRoutes = require('./routes/updateRoutes.js');
const app = express();
const port = 80;
const errorHandler = require('./errors/errorHandler');
const db = require('./config/database.js')
const mqttService = require('./controllers/mqtt.js')
const auth = require('./middleware/auth.js');
const fs = require('fs');
const https = require('https');
const path = require('path');
const deviceConfigs = require('./config/devicesConfigs.js');

// 'mqtt://127.0.0.1:1883'; // Example: public MQTT broker
const options = {
    key : fs.readFileSync('/etc/letsencrypt/live/relex.ip-ddns.com/privkey.pem'),
    cert : fs.readFileSync('/etc/letsencrypt/live/relex.ip-ddns.com/fullchain.pem')
};

// Middleware برای پردازش JSON
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
mqttService.startMqtt();


// مسیرها
app.use('/api', userRoutes);
app.use('/api/device', auth, deviceRoutes);
app.use('/api/', updateRoutes);
app.use('/api/', resetPassword);
app.get('/config/', (req, res) => {
    
    res.send(deviceConfigs);
});
// مدیریت ارورها
app.use(errorHandler);


//////////////////////////////////////////////////////////////////////////////////////////

// // یک روت ساده
app.get('/', (req, res) => {
    console.log('Html request');
    res.sendFile(path.join(__dirname,'public' ,'index.html'));
});



https.createServer(options,app).listen(443,()=>{
console.log('HTTPS server running on port 443');
});

// راه اندازی سرور
app.listen(port, () => {
    console.log('Html request port 80');
    console.log(`Server is running at http://localhost:${port}`);  
});



process.on('SIGINT', () => {
    db.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
