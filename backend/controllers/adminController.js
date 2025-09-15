const userModel = require('../models/userModel');
const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');
const { calculateOwnerAverageRating } = require('../utils/ratingUtils');
const { hashPassword } = require('../utils/passwordUtils');

function validateUserData(name, email, password, address, role) {
    const errors = [];
    if (!name || name.length < 20 || name.length > 60) {
        errors.push('Name must be between 20 and 60 characters.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format.');
    }
    if (password && (password.length < 8 || password.length > 16 || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password))) {
        errors.push('Password must be 8-16 characters long and include at least one uppercase letter and one special character (if provided).');
    }
    if (address && address.length > 400) {
        errors.push('Address cannot exceed 400 characters.');
    }
    if (role && !['System Administrator', 'Normal User', 'Store Owner'].includes(role)) {
        errors.push('Invalid user role.');
    }
    return errors;
}

function validateStoreData(name, address) {
    const errors = [];
    if (!name || name.length < 20 || name.length > 60) {
        errors.push('Store name must be between 20 and 60 characters.');
    }
    if (!address || address.length > 400) {
        errors.push('Store address cannot exceed 400 characters.');
    }
    return errors;
}

async function addAnyUser(req, res) {
    const { name, email, password, address, role } = req.body;
    const validationErrors = validateUserData(name, email, password, address, role);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required for new user creation.' });
    }
    try {
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await userModel.createUser({
            name,
            email,
            hashedPassword,
            address: address || null,
            role: role || 'Normal User'
        });
        if (newUser) {
            return res.status(201).json({
                message: 'User added successfully!',
                user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
            });
        }
        res.status(500).json({ message: 'Failed to add user.' });
    } catch (error) {
        console.error('Admin add user error:', error);
        res.status(500).json({ message: 'Internal server error during user creation.' });
    }
}

async function getDashboardMetrics(req, res) {
    try {
        const totalUsers = await userModel.getAllUsers();
        const totalStores = await storeModel.getAdminDashboardStoreCounts();
        const totalRatings = await ratingModel.getAdminDashboardRatingCounts();
        res.status(200).json({
            total_users: totalUsers.length,
            total_stores: totalStores.total_stores,
            total_submitted_ratings: totalRatings.total_ratings
        });
    } catch (error) {
        console.error('Error fetching admin dashboard metrics:', error);
        res.status(500).json({ message: 'Internal server error fetching dashboard metrics.' });
    }
}

async function getAllUsersAdmin(req, res) {
    const { name, email, address, role, field: sortField, order: sortOrder } = req.query;
    const filters = { name, email, address, role };
    const sort = { field: sortField, order: sortOrder };
    try {
        let users = await userModel.getAllUsers(filters, sort);
        for (let user of users) {
            if (user.role === 'Store Owner') {
                const ownerStores = await storeModel.getOwnerStoresWithRatings(user.id);
                user.owned_stores_average_rating = calculateOwnerAverageRating(ownerStores);
            }
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting all users (admin):', error);
        res.status(500).json({ message: 'Internal server error getting users.' });
    }
}

async function getUserDetailsAdmin(req, res) {
    const { id } = req.params;
    try {
        const user = await userModel.findUserById(parseInt(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.role === 'Store Owner') {
            const ownerStores = await storeModel.getOwnerStoresWithRatings(user.id);
            user.owned_stores_average_rating = calculateOwnerAverageRating(ownerStores);
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user details (admin):', error);
        res.status(500).json({ message: 'Internal server error getting user details.' });
    }
}

async function updateAnyUser(req, res) {
    const { id } = req.params;
    const { name, email, address, role, password } = req.body;
    const validationErrors = validateUserData(name, email, password, address, role);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    try {
        const user = await userModel.findUserById(parseInt(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const userDataToUpdate = {};
        if (name) userDataToUpdate.name = name;
        if (email) {
            const existingUserWithEmail = await userModel.findUserByEmail(email);
            if (existingUserWithEmail && existingUserWithEmail.id !== parseInt(id)) {
                return res.status(409).json({ message: 'Email already in use by another user.' });
            }
            userDataToUpdate.email = email;
        }
        if (address !== undefined) userDataToUpdate.address = address;
        if (role) userDataToUpdate.role = role;
        if (password) {
            userDataToUpdate.password = await hashPassword(password);
        }
        const updated = await userModel.updateUser(parseInt(id), userDataToUpdate);
        if (updated) {
            return res.status(200).json({ message: 'User updated successfully!' });
        }
        res.status(500).json({ message: 'Failed to update user.' });
    } catch (error) {
        console.error('Error updating user (admin):', error);
        res.status(500).json({ message: 'Internal server error updating user.' });
    }
}

async function deleteAnyUser(req, res) {
    const { id } = req.params;
    try {
        const deleted = await userModel.deleteUser(parseInt(id));
        if (deleted) {
            return res.status(200).json({ message: 'User deleted successfully!' });
        }
        res.status(404).json({ message: 'User not found or already deleted.' });
    } catch (error) {
        console.error('Error deleting user (admin):', error);
        res.status(500).json({ message: 'Internal server error deleting user.' });
    }
}

async function addStore(req, res) {
    const { name, address, owner_id } = req.body;
    const validationErrors = validateStoreData(name, address);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    try {
        const existingStore = await storeModel.findStoreByName(name);
        if (existingStore) {
            return res.status(409).json({ message: 'Store with this name already exists.' });
        }
        if (owner_id) {
            const owner = await userModel.findUserById(owner_id);
            if (!owner || owner.role !== 'Store Owner') {
                return res.status(400).json({ message: 'Provided owner_id is invalid or user is not a Store Owner.' });
            }
        }
        const newStore = await storeModel.createStore({ name, address, owner_id: owner_id || null });
        if (newStore) {
            return res.status(201).json({ message: 'Store added successfully!', store: newStore });
        }
        res.status(500).json({ message: 'Failed to add store.' });
    } catch (error) {
        console.error('Admin add store error:', error);
        res.status(500).json({ message: 'Internal server error during store creation.' });
    }
}

async function getAllStoresAdmin(req, res) {
    const { name: searchName, address: searchAddress, field: sortField, order: sortOrder } = req.query;
    try {
        const stores = await storeModel.getAllStores({ searchName, searchAddress, sortField, sortOrder }, null);
        res.status(200).json(stores);
    } catch (error) {
        console.error('Error getting all stores (admin):', error);
        res.status(500).json({ message: 'Internal server error getting stores.' });
    }
}

async function updateStore(req, res) {
    const { id } = req.params;
    const { name, address, owner_id } = req.body;
    const validationErrors = validateStoreData(name, address);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    try {
        const store = await storeModel.findStoreById(parseInt(id));
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }
        if (name && name !== store.name) {
            const existingStoreWithName = await storeModel.findStoreByName(name);
            if (existingStoreWithName && existingStoreWithName.id !== parseInt(id)) {
                return res.status(409).json({ message: 'Store with this name already exists.' });
            }
        }
        if (owner_id !== undefined) {
            if (owner_id) {
                const owner = await userModel.findUserById(owner_id);
                if (!owner || owner.role !== 'Store Owner') {
                    return res.status(400).json({ message: 'Provided owner_id is invalid or user is not a Store Owner.' });
                }
            }
        }
        const updated = await storeModel.updateStore(parseInt(id), { name, address, owner_id });
        if (updated) {
            return res.status(200).json({ message: 'Store updated successfully!' });
        }
        res.status(500).json({ message: 'Failed to update store.' });
    } catch (error) {
        console.error('Error updating store (admin):', error);
        res.status(500).json({ message: 'Internal server error updating store.' });
    }
}

async function deleteStore(req, res) {
    const { id } = req.params;
    try {
        const deleted = await storeModel.deleteStore(parseInt(id));
        if (deleted) {
            return res.status(200).json({ message: 'Store deleted successfully!' });
        }
        res.status(404).json({ message: 'Store not found or already deleted.' });
    } catch (error) {
        console.error('Error deleting store (admin):', error);
        res.status(500).json({ message: 'Internal server error deleting store.' });
    }
}

module.exports = {
    addAnyUser,
    getDashboardMetrics,
    getAllUsersAdmin,
    getUserDetailsAdmin,
    updateAnyUser,
    deleteAnyUser,
    addStore,
    getAllStoresAdmin,
    updateStore,
    deleteStore
};