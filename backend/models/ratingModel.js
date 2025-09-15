const { pool } = require('../config/db');

async function createOrUpdateRating(storeId, userId, rating) {
    try {
        const [result] = await pool.execute(
            `INSERT INTO ratings (store_id, user_id, rating) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
            [storeId, userId, rating]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error creating or updating rating:', error);
        throw error;
    }
}

async function findRatingByStoreAndUser(storeId, userId) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, store_id, user_id, rating FROM ratings WHERE store_id = ? AND user_id = ?',
            [storeId, userId]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding rating by store and user:', error);
        throw error;
    }
}

async function getAdminDashboardRatingCounts() {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) AS total_ratings FROM ratings');
        return rows[0];
    } catch (error) {
        console.error('Error getting total rating count:', error);
        throw error;
    }
}

async function getUsersWhoRatedOwnerStores(ownerId) {
    try {
        const [rows] = await pool.execute(`
            SELECT
                u.id AS user_id,
                u.name AS user_name,
                u.email AS user_email,
                r.rating,
                s.name AS store_name,
                s.id AS store_id
            FROM
                ratings r
            JOIN
                users u ON r.user_id = u.id
            JOIN
                stores s ON r.store_id = s.id
            WHERE
                s.owner_id = ?
            ORDER BY
                u.name ASC, s.name ASC
        `, [ownerId]);
        return rows;
    } catch (error) {
        console.error('Error getting users who rated owner stores:', error);
        throw error;
    }
}

module.exports = {
    createOrUpdateRating,
    findRatingByStoreAndUser,
    getAdminDashboardRatingCounts,
    getUsersWhoRatedOwnerStores
};