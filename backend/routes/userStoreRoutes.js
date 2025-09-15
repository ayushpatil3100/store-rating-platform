const express = require('express');
const router = express.Router();
const userStoreController = require('../controllers/userStoreController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const USER_ROLES = ['Normal User', 'Store Owner', 'System Administrator'];

router.use(authenticateToken);

router.get('/', authorizeRoles(USER_ROLES), userStoreController.getAllStores);
router.get('/owner/dashboard', authorizeRoles(['Store Owner']), userStoreController.getStoreOwnerDashboard);

module.exports = router;