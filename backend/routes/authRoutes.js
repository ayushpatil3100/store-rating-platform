const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/signup', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authenticateToken, authController.logoutUser);
router.put('/password', authenticateToken, authController.updateMyPassword);

module.exports = router;