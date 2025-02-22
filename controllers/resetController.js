const db = require('../repository/database');
const jwt = require('jsonwebtoken');
const SMSHelper = require('../modules/sms.js');
const bcrypt = require('bcryptjs');

function generateRandomFourDigitNumber() {
    // Generate a random number between 0 and 9999
    const randomNumber = Math.floor(Math.random() * 10000);
    // Format the number to always be 4 digits with leading zeros

    return randomNumber.toString().padStart(4, '0');
}
const forgot = async (req, res) => {
    const { phone } = req.body;

    // دریافت تمام کاربران
    const users = await db.read('users', ['id', 'phone'], { 'phone': phone });
    if (users.length === 0) {
        return res.status(400).json({ error: 'کاربر با این شماره پیدا نشد' });
    }

    const smsHelper = new SMSHelper();
    const code = generateRandomFourDigitNumber();
    console.log(code);
    smsHelper.send(phone, code);
    db.update('users', { 'code': code }, { phone: phone });

    setTimeout(() => {
        try {
            const result = db.update('users', { 'code': "0" }, { phone: phone });
            console.log(result);
        }
        catch (e) {
            console.log(e);
        }
    }, 120000);



    res.status(200).json({ success: true, message: 'یک کد به شماره شما ارسال شد' });
}

const verifyCode = async (req, res, next) => {
    const { id, code, phone } = req.body;

    const newUser = await db.read('users', ['id', 'phone'], { 'phone': phone, 'code': code });
    console.log(newUser[0]);
    if (newUser.length > 0) {

        // Generate JWT token
        const accessToken = generateAccessToken({ id: newUser[0].id, phone: newUser[0].phone }, '3m');

        res.status(200).json({ success: true, user: newUser[0], accessToken });

    } else {
        return res.status(409).json({ error: 'کد معتبر نیست' });

    }
}

const resetPassword = async (req, res) => {
    const { phone, newPassword, code } = req.body;

    try {
        let token ;
        // check token
        if (req.header('Authorization')) {
             token = req.header('Authorization').split(' ')[1];
        }
        else {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        req.user = decoded;

        //read user
        const newUser = await db.read('users', ['id', 'phone'], { 'phone': phone });
        if (newUser.length > 0) {


            // Generate JWT token
            const accessToken = generateAccessToken({ id: newUser[0].id, phone: newUser[0].phone });
            const refreshToken = generateRefreshToken({ id: newUser[0].id, phone: newUser[0].phone });
            // رمز عبور جدید را هش کنید
            const pass = bcrypt.hashSync(newPassword, 10);

            const result = db.update('users', { 'code': "0", 'password': `"${pass}"` }, { phone: phone });
            if (result) {
                console.log(result);
                return res.status(200).json({ success: true, user: newUser[0], accessToken, refreshToken });

            } else {
                return res.status(404).send({ success: false, 'error': 'خطا در بروزرسانی اطلاعات' });

            }

        }

        if (newUser.length == 0) {
            return res.status(404).send({ success: false, 'error': 'کاربر یافت نشد' });
        }


    } catch (err) {
        console.log(err);
        res.status(400).send({ success: false, 'error': 'Invalid token' });
    }
}

const generateAccessToken = (user,duration) => {
    return jwt.sign(user, process.env.JWT_SECRET_TOKEN, { expiresIn: duration ??'1h' });
};

const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_REFRESH_TOKEN);
};

module.exports = {
    forgot,
    verifyCode,
    resetPassword

};