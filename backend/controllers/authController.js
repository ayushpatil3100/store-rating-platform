const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

function validateUserRegistration(name, email, password, address) {
    const errors = [];
    if (!name || name.length < 20 || name.length > 60) {
        errors.push('Name must be between 20 and 60 characters.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format.');
    }
    if (!password || password.length < 8 || password.length > 16 || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must be 8-16 characters long and include at least one uppercase letter and one special character.');
    }
    if (address && address.length > 400) {
        errors.push('Address cannot exceed 400 characters.');
    }
    return errors;
}

async function registerUser(req, res) {
    const { name, email, password, address } = req.body;
    const validationErrors = validateUserRegistration(name, email, password, address);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    try {
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await userModel.createUser({
            name,
            email,
            hashedPassword,
            address: address || null,
            role: 'Normal User'
        });
        if (newUser) {
            const token = generateToken(newUser);
            return res.status(201).json({
                message: 'Registration successful!',
                user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
                token
            });
        }
        res.status(500).json({ message: 'Failed to register user.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = generateToken(user);
        res.status(200).json({
            message: 'Login successful!',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
}

async function updateMyPassword(req, res) {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old and new passwords are required.' });
    }
    if (newPassword.length < 8 || newPassword.length > 16 || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        return res.status(400).json({
            message: 'New password must be 8-16 characters long and include at least one uppercase letter and one special character.'
        });
    }
    try {
        const user = await userModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const userWithPassword = await userModel.findUserByEmail(user.email);
        const isMatch = await comparePassword(oldPassword, userWithPassword.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password.' });
        }
        const newHashedPassword = await hashPassword(newPassword);
        const updated = await userModel.updatePassword(userId, newHashedPassword);
        if (updated) {
            res.status(200).json({ message: 'Password updated successfully!' });
        } else {
            res.status(500).json({ message: 'Failed to update password.' });
        }
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Internal server error during password update.' });
    }
}

async function logoutUser(req, res) {
    res.status(200).json({ message: 'Logged out successfully (client should discard token).' });
}

module.exports = {
    registerUser,
    loginUser,
    updateMyPassword,
    logoutUser
};
