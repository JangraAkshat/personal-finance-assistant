const User = require('../models/userModel.js');

const getCategories = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(user.categories);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addCategory = async (req, res) => {
    const { category } = req.body;
    if (!category) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (user) {
            if (user.categories.includes(category)) {
                return res.status(400).json({ message: 'Category already exists' });
            }
            user.categories.push(category);
            await user.save();
            res.status(201).json(user.categories);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteCategory = async (req, res) => {
    const { category } = req.body;
    if (!category) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.categories = user.categories.filter(c => c !== category);
            await user.save();
            res.json(user.categories);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getCategories, addCategory, deleteCategory };