

const conf = {
    "ussd": {
        "mci": "AT+CUSD=1,\"*140*11#\"",
        "irancell": "AT+CUSD=1,\"*140*11#\"",
        "rightel": "AT+CUSD=1,\"*140*121#\""
    },
    "updateUrl": 'https://mandopart/',

    "models": [
        {
            "name": "G44-TR",
            "outputs": 4,
            "inputs": 4,
            "gsm": false,
            "wifi": true,
            "rf": true,
            'lastVersion': 2,
            "temperature": true

        },
        {
            "name": "G84-T",
            "outputs": 8,
            "inputs": 4,
            "gsm": true,
            "wifi": true,
            "rf": true,
            'lastVersion': 2,

            "temperature": true
        },
        {
            "name": "G84-TR",
            "outputs": 8,
            "inputs": 4,
            "gsm": true,
            "wifi": true,
            "rf": false,
            'lastVersion': 2,

            "temperature": true
        },

        {
            "name": "G104-T",
            "outputs": 10,
            "inputs": 4,
            "gsm": true,
            "wifi": true,
            "rf": false,
            'lastVersion': 2,

            "temperature": true
        },


    ]

};

module.exports = conf;