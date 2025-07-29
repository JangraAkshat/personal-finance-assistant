const express = require('express');
const router = express.Router();

const {
    addTransaction, 
    getTransactions, 
    getSummary, 
    uploadReceipt, 
    upload, 
    updateTransaction, 
    deleteTransaction
} = require('../controllers/transactionController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

router.get('/summary', protect, getSummary);
router.post('/upload-receipt', protect, upload.single('receipt'), uploadReceipt);

router.route('/:id')
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction);

module.exports = router;
