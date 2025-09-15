const { pool } = require('../config/db');

async function createStore(storeData) {
    const { name, address, owner_id } = storeData;
    try {
        const [result] = await pool.execute(
            'INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)',
            [name, address, owner_id]
        );
        if (result.affectedRows > 0) {
            return { id: result.insertId, name, address, owner_id };
        }
        return null;
    } catch (error) {
        console.error('Error creating store:', error);
        throw error;
    }
}

async function findStoreById(storeId) {
    try {
        const [rows] = await pool.execute('SELECT id, name, address, owner_id FROM stores WHERE id = ?', [storeId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding store by ID:', error);
        throw error;
    }
}

async function findStoreByName(storeName) {
    try {
        const [rows] = await pool.execute('SELECT id, name, address, owner_id FROM stores WHERE name = ?', [storeName]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding store by name:', error);
        throw error;
    }
}

async function getAllStores(options = {}, userId = null) {
    const { searchName, searchAddress, sortField, sortOrder } = options;
    let query = `
        SELECT
            s.id,
            s.name,
            s.address,
            s.owner_id,
            COALESCE(AVG(r.rating), 0) AS overall_rating
            ${userId ? ', (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_submitted_rating' : ''}
        FROM
            stores s
        LEFT JOIN
            ratings r ON s.id = r.store_id
        WHERE 1=1
    `;
    const params = [];

    if (userId) {
        params.push(userId);
    }

    if (searchName) {
        query += ' AND s.name LIKE ?';
        params.push(`%${searchName}%`);
    }
    if (searchAddress) {
        query += ' AND s.address LIKE ?';
        params.push(`%${searchAddress}%`);
    }

    query += ' GROUP BY s.id, s.name, s.address, s.owner_id';

    if (sortField && ['name', 'address', 'overall_rating'].includes(sortField)) {
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortField} ${order}`;
    } else {
        query += ` ORDER BY s.name ASC`;
    }

    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error getting all stores:', error);
        throw error;
    }
}

async function updateStore(storeId, storeData) {
    const fields = [];
    const params = [];
    if (storeData.name) {
        fields.push('name = ?');
        params.push(storeData.name);
    }
    if (storeData.address) {
        fields.push('address = ?');
        params.push(storeData.address);
    }
    if (storeData.owner_id !== undefined) {
        fields.push('owner_id = ?');
        params.push(storeData.owner_id);
    }

    if (fields.length === 0) {
        return false;
    }

    const query = `UPDATE stores SET ${fields.join(', ')} WHERE id = ?`;
    params.push(storeId);

    try {
        const [result] = await pool.execute(query, params);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating store:', error);
        throw error;
    }
}

async function deleteStore(storeId) {
    try {
        const [result] = await pool.execute('DELETE FROM stores WHERE id = ?', [storeId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting store:', error);
        throw error;
    }
}

async function getAdminDashboardStoreCounts() {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) AS total_stores FROM stores');
        return rows[0];
    } catch (error) {
        console.error('Error getting total store count:', error);
        throw error;
    }
}

async function getOwnerStoresWithRatings(ownerId) {
    try {
        const [rows] = await pool.execute(`
            SELECT
                s.id,
                s.name,
                s.address,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COUNT(r.rating) AS rating_count
            FROM
                stores s
            LEFT JOIN
                ratings r ON s.id = r.store_id
            WHERE
                s.owner_id = ?
            GROUP BY
                s.id, s.name, s.address
            ORDER BY
                s.name ASC
        `, [ownerId]);
        return rows;
    } catch (error) {
        console.error('Error getting owner stores with ratings:', error);
        throw error;
    }
}

module.exports = {
    createStore,
    findStoreById,
    findStoreByName,
    getAllStores,
    updateStore,
    deleteStore,
    getAdminDashboardStoreCounts,
    getOwnerStoresWithRatings
};