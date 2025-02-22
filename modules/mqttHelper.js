const mqtt = require('mqtt');
// Update with your MQTT broker URL

const clientId = `mqtt_${Math.random().toString(16).slice(3)}`; // Uniquely identify the client

class MqttHelper {



    connect() {
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect('mqtt://localhost:1883', {
                clientId,username:'hosein282',password:'At9127995883'
            });

            this.client.on('connect', () => {

                console.log('Connected to MQTT broker');

                resolve();
            });

            this.client.on('error', (error) => {
                console.error('Connection error:', error);
                reject(error);
            });
        });

    }

    subscribe(topic, options = {}) {
        return new Promise((resolve, reject) => {
            this.client.subscribe(topic, options, (err) => {
                if (err) {
                    console.error('Error subscribing to topic:', err);
                    return reject(err);
                }
                console.log(`Subscribed to topic: ${topic}`);
                resolve();
            });
        });
    }

    publish(topic, message, options = {}) {
        return new Promise((resolve, reject) => {
            this.client.publish(topic, message.toString('utf8'), { qos: 0, ...options }, (err) => {
                if (err) {
                    console.error('Error publishing message:', err);
                    return reject(err);
                }
                console.log(`Message published to ${topic}: ${message}`);
                resolve();
            });
        });
    }

    onMessage(callback) {
        this.client.on('message', (topic, message) => {
            callback(topic, message);
        });
    }

    disconnect() {
        return new Promise((resolve) => {
            this.client.end(() => {
                console.log('Disconnected from MQTT broker');
                resolve();
            });
        });
    }


 


}

module.exports = MqttHelper; // Export the MqttHelper class


