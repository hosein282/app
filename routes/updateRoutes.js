// src/routes/userRoutes.js
const express = require('express');
const updateController = require('../controllers/updateController');

const router = express.Router();

router.get('/download', updateController.geUpdate);


module.exports = router;
