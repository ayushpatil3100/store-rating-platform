const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');
const { calculateOwnerAverageRating } = require('../utils/ratingUtils');

async function getAllStores(req, res) {
    const { name: searchName, address: searchAddress, field: sortField, order: sortOrder } = req.query;
    const userId = req.user ? req.user.id : null;
    const options = { searchName, searchAddress, sortField, sortOrder };
    try {
        const stores = await storeModel.getAllStores(options, userId);
        res.status(200).json(stores);
    } catch (error) {
        console.error('Error getting all stores (user/owner):', error);
        res.status(500).json({ message: 'Internal server error getting stores.' });
    }
}

async function getStoreOwnerDashboard(req, res) {
    const ownerId = req.user.id;
    try {
        const ownerStoresWithRatings = await storeModel.getOwnerStoresWithRatings(ownerId);
        const usersWhoRated = await ratingModel.getUsersWhoRatedOwnerStores(ownerId);
        const overallAverageRating = calculateOwnerAverageRating(ownerStoresWithRatings);
        res.status(200).json({
            owner_stores: ownerStoresWithRatings,
            users_who_rated: usersWhoRated,
            overall_average_rating_of_owned_stores: overallAverageRating
        });
    } catch (error) {
        console.error('Error fetching store owner dashboard:', error);
        res.status(500).json({ message: 'Internal server error fetching store owner dashboard.' });
    }
}

module.exports = {
    getAllStores,
    getStoreOwnerDashboard
};