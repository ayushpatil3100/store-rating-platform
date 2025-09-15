const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const NORMAL_USER_ROLE = ['Normal User'];

router.use(authenticateToken);
router.use(authorizeRoles(NORMAL_USER_ROLE));

router.post('/:storeId', ratingController.submitRating);
router.put('/:storeId', ratingController.submitRating);

module.exports = router;