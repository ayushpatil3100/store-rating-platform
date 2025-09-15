function calculateOwnerAverageRating(ownerStores) {
    if (!ownerStores || ownerStores.length === 0) {
        return 0;
    }
    const ratedStores = ownerStores.filter(store => store.rating_count > 0);
    if (ratedStores.length === 0) {
        return 0;
    }
    const totalRatingSum = ratedStores.reduce((sum, store) => sum + store.average_rating, 0);
    return totalRatingSum / ratedStores.length;
}

module.exports = {
    calculateOwnerAverageRating
};

