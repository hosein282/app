// src/routes/userRoutes.js
const express = require('express');
const resetController = require('../controllers/resetController.js');

const router = express.Router();

router.post('/forgot-password', resetController.forgot);
router.post('/verify-forget', resetController.verifyCode);
router.post('/reset-password', resetController.resetPassword);


module.exports = router;
