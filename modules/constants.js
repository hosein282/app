


const appServer = 'local';
// config.js
const config = {
    local: {
        db: {
            host: 'localhost',     // Your database host
            user: 'remote_user',          // Your database username
            password: 'll00iiuu', // Your database password
            database: 'users'     // Your database name
        },
        server: {
            port: 3036,
        },

        mqttBrokerUrl :'mqtt://broker.emqx.io:1883',
        // '127.0.0.1:1883',
        // 'mqtt://127.0.0.1:1883'; // Example: public MQTT broker
        server_topic : 'action_server',// Example: public MQTT broker
        report_topic : 'report_state' // Example: public MQTT broker
    },
    host: {
        db: {
            host: 'users',     // Your database host
            user: 'root',          // Your database username
            password: 'KLzsmLlNcFJ95dawtOCPTLcf', // Your database password
            database: 'brave_austin'     // Your database name
        },
        server: {
            port: 33036, // or 443 for HTTPS
        },
        mqttBrokerUrl : 'broker.emqx.io',
        // 'mqtt://127.0.0.1:1883'; // Example: public MQTT broker
        server_topic : 'action_server',// Example: public MQTT broker
        report_topic : 'report_state' // Example: public MQTT broker
    },
};

// Function to get config based on the environment
function getConfig() {
    const mode = appServer; // Default to local mode
    console.log(mode);
    return config[mode];
}

module.exports = getConfig();