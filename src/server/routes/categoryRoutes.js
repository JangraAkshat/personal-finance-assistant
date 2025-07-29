const express = require('express');
const router = express.Router();
const { getCategories, addCategory, deleteCategory } = require('../controllers/categoryController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/')
    .get(protect, getCategories)
    .post(protect, addCategory)
    .delete(protect, deleteCategory);

module.exports = router;