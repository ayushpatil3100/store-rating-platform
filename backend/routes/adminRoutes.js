const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const ADMIN_ROLE = ['System Administrator'];

router.use(authenticateToken);
router.use(authorizeRoles(ADMIN_ROLE));

router.get('/dashboard', adminController.getDashboardMetrics);
router.post('/users', adminController.addAnyUser);
router.get('/users', adminController.getAllUsersAdmin);
router.get('/users/:id', adminController.getUserDetailsAdmin);
router.put('/users/:id', adminController.updateAnyUser);
router.delete('/users/:id', adminController.deleteAnyUser);
router.post('/stores', adminController.addStore);
router.get('/stores', adminController.getAllStoresAdmin);
router.put('/stores/:id', adminController.updateStore);
router.delete('/stores/:id', adminController.deleteStore);

module.exports = router;