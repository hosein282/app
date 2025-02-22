// src/controllers/userController.js
const db = require('../repository/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sms = require('../modules/sms.js');
const SMSHelper = require('../modules/sms.js');



const createUser = async (req, res, next) => {

    try {
        const { username, password, phone, email } = req.body;

        const user = await db.read('users', [], { 'phone': phone });
        if (user.length > 0) {
            if (user.code === 0) {
                const smsHelper = new SMSHelper();
                const code = generateRandomFourDigitNumber();
                console.log(code);
                smsHelper.send(phone, code);
                setTimeout(() => {
                    try {
                        const result = db.delete('users', { phone: phone });
                        console.log(result);
                    }
                    catch (e) {
                        console.log(e);
                    }
                }, 120000);
                try {
                    // ایجاد کاربر جدید
                    const result = await db.create('users', { 'phone': phone, 'code': code });

                    const newUser = await db.read('users', ['id', 'phone'], { 'phone': phone });
                    if (newUser.length) {


                        res.status(200).json({ success: true, id: newUser[0].id });
                    }
                } catch (err) {
                    next(err);
                }

            } else {

                return res.status(409).json({ error: 'این نام کاربری قبلا ثبت شده است' });
            }

        } else {
            if (validateMobile(phone)) {
                const smsHelper = new SMSHelper();
                const code = generateRandomFourDigitNumber();
                console.log(code);
                smsHelper.send(phone, code);
                setTimeout(() => {
                    try {
                        const result = db.delete('users', { phone: phone });
                        console.log(result);
                    }
                    catch (e) {
                        console.log(e);
                    }
                }, 120000);

                try {

                    // ایجاد کاربر جدید
                    const result = await db.create('users', { 'phone': phone, 'code': code });

                    const newUser = await db.read('users', ['id', 'phone'], { 'phone': phone });
                    if (newUser.length) {


                        res.status(200).json({ success: true, id: newUser[0].id });
                    }
                } catch (err) {
                    console.log(e);

                    next(err);
                }
            } else {
                return res.status(409).json({ error: 'شماره موبایل معتبر نیست' });
            }

        }
    } catch (err) {
        next(err);
    }


};

const verifyUser = async (req, res, next) => {
    const { id, code, password } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`hashedPassword: ${hashedPassword}`);

    const newUser = await db.read('users', ['id', 'phone'], { 'id': id, 'code': code});


    console.log(newUser[0]);
    if (newUser.length > 0) {
        try{            
            const result = db.update('users',[{'password': password}] , { phone: phone });
    
        }catch(e){
            console.log(e);
        }

        // Generate JWT token
        const accessToken = generateAccessToken({ id: newUser[0].id, phone: newUser[0].phone });
        const refreshToken = generateRefreshToken({ id: newUser[0].id, phone: newUser[0].phone });
        res.status(200).json({ success: true, user: newUser[0], accessToken, refreshToken });

    } else {
        return res.status(409).json({ error: 'کد معتبر نیست' });

    }


}

const getUserByName = async (req, res, next) => {
    const { username } = req.query;
    console.log(username);
    try {
        //دریافت کاربر با یوزر نیم
        const result = await db.read('users', ['id,username'], { 'username': username });
        res.status(200).json(result[0]);
    } catch (err) {
        next(err)
    }
}

const getUsers = async (req, res, next) => {
    const { phone, password } = req.body;
    try {

        // دریافت تمام کاربران
        const users = await db.read('users', ['id', 'phone', 'password'], { 'phone': phone });
        if (users.length === 0) {
            return res.status(400).json({ error: 'نام کاربری یا رمز عبور نادرست است' });
        }
        // Compare the password
        const isMatch = await bcrypt.compare(password, users[0].password);

        if (!isMatch) {
            return res.status(400).json({ error: 'نام کاربری یا رمز عبور نادرست است' });
        }

        const accessToken = generateAccessToken({ id: users[0].id, phone: users[0].phone });
        const refreshToken = generateRefreshToken({ id: users[0].id, phone: users[0].phone });

        delete users[0]['password'];
        res.json({ "user": users[0], accessToken, refreshToken });
    } catch (err) {
        return res.status(409).json({ error: 'ایمیل معتبر نیست' });

        next(err);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;

        // بروزرسانی کاربر
        await db.update('users', { name, phone }, { id });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // حذف کاربر
        await db.delete('users', { id });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};
const refreshToken = (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
        const accessToken = generateAccessToken({ id: decoded.id, phone: decoded.phone });
        const refreshToken = generateRefreshToken({ id: decoded.id, phone: decoded.phone });

        res.json({ success: true, accessToken, refreshToken });
    } catch (err) {
        res.status(400).json({ error: 'Invalid refresh token.' });
    }
};

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET_TOKEN, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_REFRESH_TOKEN);
};

// Function to validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09\d{9}$/; // Matches '09123456789', '09127995883', etc.

    return emailRegex.test(email);
}
function validateMobile(phone) {
    const phoneRegex = /^09\d{9}$/; // Matches '09123456789', '09127995883', etc.

    return phoneRegex.test(phone);
}

function generateRandomFourDigitNumber() {
    // Generate a random number between 0 and 9999
    const randomNumber = Math.floor(Math.random() * 10000);
    // Format the number to always be 4 digits with leading zeros

    return randomNumber.toString().padStart(4, '0');
}


module.exports = {
    createUser,
    getUserByName,
    getUsers,
    updateUser,
    deleteUser,
    refreshToken,
    verifyUser,
    generateRandomFourDigitNumber
};
