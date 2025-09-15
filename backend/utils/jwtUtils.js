const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken
};