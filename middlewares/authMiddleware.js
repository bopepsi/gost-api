// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../env' });

// Middleware to verify token and extract user info
const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];  // Extract token after 'Bearer'

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the user info from the token to the request
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};



// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admins only' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin
};
