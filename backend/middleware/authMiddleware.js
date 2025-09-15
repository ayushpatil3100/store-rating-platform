const { verifyToken } = require('../utils/jwtUtils');
const userModel = require('../models/userModel');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    try {
        const user = await userModel.findUserById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error fetching user after token verification:', error);
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
}

module.exports = authenticateToken;