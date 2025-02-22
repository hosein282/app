// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userController.createUser);
router.post('/verify', userController.verifyUser);
router.post('/signin', userController.getUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/user',userController.getUserByName);
router.post('/refresh-token', userController.refreshToken);


module.exports = router;
