const { pool } = require('../config/db');
const mysql = require('mysql2');

async function createUser(userData) {
    const { name, email, hashedPassword, address, role } = userData;
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, address, role]
        );
        if (result.affectedRows > 0) {
            return { id: result.insertId, name, email, address, role };
        }
        return null;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

async function findUserByEmail(email) {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, password, address, role FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
}

async function findUserById(id) {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, address, role FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
}

async function updatePassword(userId, newHashedPassword) {
    try {
        const [result] = await pool.execute('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, userId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
}

async function getAllUsers(filters = {}, sort = {}) {
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params = [];

    if (filters.name) {
        query += ' AND name LIKE ?';
        params.push(`%${filters.name}%`);
    }
    if (filters.email) {
        query += ' AND email LIKE ?';
        params.push(`%${filters.email}%`);
    }
    if (filters.address) {
        query += ' AND address LIKE ?';
        params.push(`%${filters.address}%`);
    }
    if (filters.role) {
        query += ' AND role = ?';
        params.push(filters.role);
    }

    if (sort.field && ['name', 'email', 'address', 'role'].includes(sort.field)) {
        const order = sort.order && sort.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${mysql.escapeId(sort.field)} ${order}`;
    } else {
        query += ` ORDER BY name ASC`;
    }

    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
}

async function updateUser(userId, userData) {
    const fields = [];
    const params = [];
    if (userData.name) {
        fields.push('name = ?');
        params.push(userData.name);
    }
    if (userData.email) {
        fields.push('email = ?');
        params.push(userData.email);
    }
    if (userData.password) {
        fields.push('password = ?');
        params.push(userData.password);
    }
    if (userData.address !== undefined) {
        fields.push('address = ?');
        params.push(userData.address);
    }
    if (userData.role) {
        fields.push('role = ?');
        params.push(userData.role);
    }

    if (fields.length === 0) {
        return false;
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    params.push(userId);

    try {
        const [result] = await pool.execute(query, params);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updatePassword,
    getAllUsers,
    updateUser,
    deleteUser
};