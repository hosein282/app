
const MelipayamakApi = require('melipayamak')


const username = process.env.PAYAMAK_USER;
const password = process.env.PAYAMAK_PASS;


class SMSHelper {
    send(to, text) {
        return new Promise((resolve, reject) => {
            const api = new MelipayamakApi(username, password);

            const smsRest = api.sms();

            // smsRest.sendByBaseNumber([text], to, 295378).then(res => {
            //     //RecId or Error Number 
            // }).catch(err => {
            //     //
            // });


        });
    }
}

module.exports = SMSHelper;



