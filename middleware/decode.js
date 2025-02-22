const jwt = require('jsonwebtoken');

const getUserId = (req, res) => {
    try {
        // console.log(req.header('Authorization'));
        if(req.header('Authorization') === undefined) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const token = req.header('Authorization').split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        req.user = decoded;
        return decoded.id;
    } catch (err) {
        console.error(err);
        if(err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Access denied. Token expired.' });
        }
        res.status(401).json({ error: 'Invalid token.' });
    }
};



module.exports = getUserId;