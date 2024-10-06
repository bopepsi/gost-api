// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {getAllUsers,userLogin} = require('../controllers/usersControllers')

// Login route
router.post('/login', userLogin);

router.post('/allusers', getAllUsers);

module.exports = router;
