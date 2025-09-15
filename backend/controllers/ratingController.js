const ratingModel = require('../models/ratingModel');
const storeModel = require('../models/storeModel');

async function submitRating(req, res) {
    const storeId = parseInt(req.params.storeId);
    const userId = req.user.id;
    const { rating } = req.body;
    if (rating === undefined || rating === null || isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }
    try {
        const store = await storeModel.findStoreById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }
        const success = await ratingModel.createOrUpdateRating(storeId, userId, rating);
        if (success) {
            return res.status(200).json({ message: 'Rating submitted/updated successfully!' });
        }
        res.status(500).json({ message: 'Failed to submit or update rating.' });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Internal server error submitting rating.' });
    }
}

module.exports = {
    submitRating
};