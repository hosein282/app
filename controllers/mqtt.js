
const MqttHelper = require('../modules/mqttHelper'); // Adjust the path as needed
const config = require('../modules/constants.js');
const db = require('../repository/database');
const bodyParser = require('body-parser');
const nodecipher = require('node-cipher');

const mqttBrokerUrl = 'mqtt://broker.emqx.io:1883';


const mqttClient = new MqttHelper(mqttBrokerUrl);
async function startMqtt() {

    try {
        await mqttClient.connect();

        await mqttClient.subscribe(config.server_topic);
        // await mqttClient.subscribe(config.report_topic);
        console.log(mqttBrokerUrl);
        // Handler for incoming messages
        mqttClient.onMessage((topic, message) => {
            console.log(`Received message on topic ${topic}`);
            console.log(`message[0]: ${message[0]}`);
            var data;

            if (message[0] == 123) {
                try {
                    data = JSON.parse(message);
                }
                catch (e) {
                    console.log("1231232132132321321321");
                    console.log(e);
                    return;

                }
            } else {
                try {
                    data = base64ToObject(`"${message}"`);
                } catch (e) {
                    console.log("base646464646464646464");

                    console.log(e);
                    return;
                }
            }

            handleMqttReport(data);
            // report by device
            if (topic === config.server_topic) {

                // do action 
            } else if (topic === config.report_topic) {
                // handleMqttMessage(data);
            }
        });

    } catch (error) {
        console.error('Error in MQTT operation:', error);
    }

    // Cleanup / disconnect the client when needed
    // Uncomment to disconnect after 10 seconds for cleanup
    // setTimeout(async () => {
    //     await mqttClient.disconnect();
    // }, 10000);

}

function handleMqttReport(message) {

    const { event, op, ain, temps,  mac, sets, oSt, iSt, sig, tims, progs, status, pwm } = message;
    console.log(`message: ${JSON.stringify(message)}`);

    ////////////////////////////////////////////////
    if (event === 'report') {

        var data = {
            ...(op != null && { operator: op }),

            ...(ain != null && { analog: `${[Number(ain[0]) , Number(ain[1])]}` }),
            ...(temps != null && { temps: `${[Number(temps[0].toFixed(2)) , Number(temps[1]).toFixed(2),Number(temps[2]).toFixed(2)]}` }),
            // ...(temp1 != null && { temp1: Number(temp1.toFixed(2)) }),
            // ...(temp2 != null && { temp2: Number(temp2.toFixed(2)) }),
            ...(sig != null && { signalQ: Number(sig) }),
            ...(sets != null && { setting: sets }),
            ...(oSt != null && { outStates: oSt }),
            ...(iSt != null && { inStates: iSt }),
            ...({ connected: Math.round(Date.now() / 1000) }),
            ...(status != null && { status: status }),
            ...(tims != null && { timers: tims }),
            ...(progs != null && { programs: progs }),
            ...(pwm != null && { pwm: pwm }),
        };
        console.log(`data: ${JSON.stringify(data)}`);


        // const data = JSON.stringify(data);
        db.update('devices', data, { mac }).then((result) => {
            if (result) {
                const topic = "sub" + ">" + mac;
                console.log(`qttClient.publish: ${JSON.stringify(data)}`);
                if (event != null) {
                    data['event'] = event;
                }

                mqttClient.publish(topic, JSON.stringify(data));
                console.log("updated!");

            } else {
                console.log("not updated!");
            }
        });

        ////////////////////////////////////////////////


    } else if (event === 'feedback') {

        let data = prepareData(message);

        if (data['update'] === false) {
            const topic = "sub" + ">" + mac;
            mqttClient.publish(topic, JSON.stringify(message));
            return;
        }

        db.update('devices', data, { mac }).then((result) => {
            if (result) {
                const topic = "sub" + ">" + mac;
                mqttClient.publish(topic, JSON.stringify(message));
                console.log("updated!");

            } else {
                console.log("not updated!");
            }
        });
        ////////////////////////////////////////////////
    } else if (event == "log") {
        let updateData = prepareData(message);
        let data = {};
        data['mac_id'] = mac;
        data['status'] = 'ONLINE';
        data['connected'] = Math.round(Date.now() / 1000);
        data['analog'] = `${[Number(ain[0]), Number(ain[1])]}`;
       if(temps != null) data['temps']= `${[Number(temps[0].toFixed(2)) , Number(temps[1]).toFixed(2),Number(temps[2]).toFixed(2)]}` ;
        // data['temp0'] = Number(temp0.toFixed(2));
        // data['temp1'] = Number(temp1.toFixed(2));
        // data['temp2'] = Number(temp2.toFixed(2));
        // data.remove('temperature');
        console.log(`DATA LOG : ${JSON.stringify(data)}`);
        db.create('device_log', data).then((result) => {
            if (result) {
                const topic = "sub" + ">" + mac;
                data['event'] = 'report';
                mqttClient.publish(topic, JSON.stringify(data));
                console.log("created!");

            } else {
                console.log("not updated!");
            }
        });

        db.update('devices', updateData, { mac }).then((result) => {
            if (result) {
                const topic = "sub" + ">" + mac;
                // mqttClient.publish(topic, JSON.stringify(message));
                console.log("updated!");

            } else {
                console.log("not updated!");
            }
        });
        ////////////////////////////////////////////////

    } else if (event === 'state') {
        var data = {
            ...(status != null && { status: status }),
            ...({ connected: Math.round(Date.now() / 1000) }),
        };
        console.log(`state data: ${data}`);

        db.update('devices', data, { mac }).then((result) => {
            if (result) {
                const topic = "sub" + ">" + mac;
                console.log(`qttClient.publish: ${JSON.stringify(data)}`);
                if (event != null) {
                    data['event'] = event;
                }

                mqttClient.publish(topic, JSON.stringify(data));
                console.log("updated!");
            } else {
                console.log("not updated!");
            }
        });
        ////////////////////////////////////////////////

    } else if (event === 'io') {
        handleMqttMessage(message);
    }
    else if (event === 'pwm') {
        handleMqttMessage(message);
    } else if (event === 'timer') {
        handleMqttMessage(message);

    } else if (event === 'scn') {
        handleMqttMessage(message);

    } else if (event === 'status') {
        getStatusFromDb(message);
    } else if (event === 'update') {
        handleMqttMessage(message);

    }
    console.log(mac);
}


function prepareData(message) {
    const { event, op, ain, temps, pwm, percent, sets, oSt, iSt, sig, update, tims, progs,status } = message;
//"temps":[26.75,-127,-127],"ain":[0,0],"op":"mci","sig":"20","mac":"D8:13:2A:7F:A2:28","event":"feedback","status":"ONLINE","sets":"10111","tims":"0123456/04/01:02,-,-,01234**/01/00:20,t20,t18","progs":"2:>:2.2:4:0,-,-,-","oSt":"010100","iSt":"00","pwm":"0,34"}
// {"mac":"D8:13:2A:7F:A2:28","event":"feedback","oSt":"010100"}
  try{
    var data = {
        ...(op != null && { operator: op }),
        ...(ain != null && { analog: `${[Number(ain[0]) , Number(ain[1])]}` }),
        ...(temps != null && { temps: `${[Number(temps[0].toFixed(2)) , Number(temps[1]).toFixed(2),Number(temps[2]).toFixed(2)]}` }),
        ...(sig != null && { signalQ: Number(sig) }),
        ...(sets != null && { setting: sets }),
        ...(oSt != null && { outStates: oSt }),
        ...(iSt != null && { inStates: iSt }),
        ...({ connected: Math.round(Date.now() / 1000) }),
        ...(tims != null && { timers: tims }),
        ...(progs != null && { programs: progs }),
        ...(pwm != null && { pwm: pwm }),
        ...(update != null && { update: update }),
        ...(percent != null && { percent: percent }),
        ...(status != null && { status: status }),
        // ...({ status: "ONLINE" }),



    };
  }catch(e){
    console.log(`prepare DATA ERROR ${e}`);
  }

    console.log('prepareData');
    return data;
}
function handleMqttMessage(message) {

    const { mac, out, state, event, timer, value, label, url, version, result, pwm, percent } = message; // Destructure the body
    if (mac != "" && mac != undefined) {
        const topic = "action" + ">" + mac;
        const data = { 'mac': mac };
        if (out !== undefined) data.out = out;
        if (state !== undefined) data.state = state;
        if (event !== undefined) data.event = event;
        if (timer !== undefined) data.timer = timer;
        if (value !== undefined) data.value = value;
        if (label !== undefined) data.label = label;
        if (result !== undefined) data.result = result;
        if (pwm !== undefined) data.pwm = pwm;
        if (percent !== undefined) data.percent = percent;
        if (url !== undefined) data.url = url;
        if (version !== undefined) data.version = version;
        console.log(">>>>>>>>>>>>>>>>handle mqtt data");
        console.log(data);

        mqttClient.publish(topic, objectToBase64(data));
    } else {
        console.log("receiver device mac is not initialized!");
    }

}

function getStatusFromDb(message) {
    const { mac, event } = message; // Destructure the body

    if (mac != "" && mac != undefined) {
        const topic = "sub" + ">" + mac;
        db.read('devices', [
            "label",
            "outStates",
            "inStates",
            "analog",
            "operator",
            "signalQ",
            "setting",
            "connected",
            "status",
            "timers",
            "programs",
            "pwm"
    
        ], { 'mac': mac }).then((result) => {
            if (result) {
                result[0]['event'] = 'status';
                // const str = JSON.parse(JSON.stringify(result[0])).label;
                // console.log(str);
                result[0].remove
                console.log(JSON.stringify(result[0]));
                mqttClient.publish(topic, JSON.stringify(result[0]));

            }
        });


    } else {
        console.log("receiver device mac is not initialized!");
    }
}


// Function to convert any object to base64
function objectToBase64(obj) {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj);

    // Encode the JSON string to base64
    const base64String = Buffer.from(jsonString).toString('base64');

    return base64String;
}

function base64ToObject(base64String) {
    // Decode the base64 string to JSON
    console.log(`base64String: ${base64String}`);
    const jsonString = Buffer.from(base64String, 'base64').toString('utf8');
    console.log(`jsonString: ${jsonString}`);

    // Parse the JSON string to an object
    const obj = JSON.parse(jsonString);

    return obj;
}

module.exports = {
    startMqtt
}