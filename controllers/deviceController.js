
const db = require('../repository/database');
const getUserId = require('../middleware/decode.js');
const deviceConfigs = require('../config/devicesConfigs.js');

const createDevice = async (req, res) => {
    const { user_id, mac, label, model } = req.body; // Destructure the body
    console.log(req.body);
    let outputs, inputs = "";


    try {
         const conf = deviceConfigs.models.filter(modelConf => modelConf.name.toLowerCase() == model.toLowerCase());
         if(conf.length ==0){
            return res.status(400).json({ 'error': "مدل دستگاه اشتباه است" });
         }
         for(var i = 0 ;i<conf[0].outputs; i++){
            outputs =+ "0";
         }
         for(var i = 0 ;i<conf[0].inputs; i++){
            inputs =+ "0";
         }
         console.log(outputs);

        if (!user_id || !mac) {
            return res.status(400).json({ 'error': 'اطلاعات ارسالی ناقص است' });
        }

        const parameters = { 'outStates': outputs, 'inStates': inputs,  };

        if (user_id !== null) {
            parameters.user_id = user_id;
        }
        if (mac !== null) {
            parameters.mac = mac;
        }
        if (label !== null) {
            parameters.label = label;
        }
        if (model !== null) {
            parameters.model = model;
        }

        console.log(`parameters =>${JSON.stringify(parameters)}`);

        const result = await db.create('devices', JSON.parse(JSON.stringify(parameters)));
        if (result.affectedRows == 1 && result.serverStatus == 2) {
            return res.status(200).json({ 'success': true });

        } else {
            return res.status(500).json({ 'error': 'اطلاعات ارسالی ناقص است' });

        }


    } catch (err) {
        console.log('carchhh');
        console.log(`err =>${err}`);


        if (err.errno === 1062) {
            return res.status(400).json({ 'error': "این دستگاه قبلا ثبت شده است" });
        }
        return res.status(400).json({ 'error': err });

    }

}


const getDevices = async (req, res) => {
    const { user_id } = req.query;
    console.log(user_id);
    try {
        const devices = await db.read('devices', [], { 'user_id': user_id });
        if (devices) {
            return res.status(200).json({ devices });
        }
    } catch (err) {
        return res.status(500);
    }


}

const deleteDevice = async (req, res) => {
    const { mac } = req.body;
    console.log(mac);
    try {
       const id = getUserId(req);

        console.log(id);

        const devices = await db.delete('devices', { 'mac': mac, 'user_id': id });
        if (devices.affectedRows >0) {
            return res.status(200).json({ success : true ,message : 'دستگاه با موفقیت حذف شد'});
        }else{
            return res.status(403).json({ success : false , 'error' : "محدودیت اجازه دسترسی" });

        }
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}

module.exports = {
    createDevice,
    getDevices,
    deleteDevice

};