const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/dbConfig');
require('dotenv').config({ path: '../env' });

const userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`SELECT * FROM brdrch.dbo.users WHERE username = '${username}'`);

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = result.recordset[0];
        const passwordMatch = (password == user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        // Generate JWT Token including user ID, role, and name
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET
            //'gost',
            //{ expiresIn: '1h' }
        );

        // Return the token and the user's role to the frontend
        res.json({
            token,
            user: user.name,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const getAllUsers = async (req, res) => {
    if (req.body.role === 'user') { return res.status(500).json({ message: 'Not authorized' }); };

    try {
        const pool = await poolPromise;
        const users = await pool.request().query('SELECT * FROM brdrch.dbo.users');

        // Return the list of users
        res.json(users.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

module.exports = {
    userLogin,
    getAllUsers
}
