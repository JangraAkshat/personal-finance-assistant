const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/userController.js');

router.post('/register', registerUser);
router.post('/login', authUser);

module.exports = router;