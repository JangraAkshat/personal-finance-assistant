const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel.js');
const { createWorker } = require('tesseract.js');
const multer = require('multer');
const sharp = require('sharp');
const pdf = require('pdf-parse');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const addTransaction = async (req, res) => {
    const { description, amount, type, category, date } = req.body;
    const transaction = new Transaction({
        description, amount, type, category,
        date: date ? new Date(date) : new Date(),
        user: req.user._id,
    });
    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
};

const getTransactions = async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.search ? {
        description: { $regex: req.query.search, $options: 'i' },
    } : {};
    let query = { user: req.user._id, ...keyword };
    const count = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
        .sort({ updatedAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    res.json({ transactions, page, pages: Math.ceil(count / pageSize) });
};

const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transaction.user.toString() !== req.user._id.toString()) {
            //to ensure that a user can only modify their own transactions
            return res.status(401).json({ message: 'Not authorized' });
        }
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedTransaction);
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Server Error while updating." });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transaction.user.toString() !== req.user._id.toString()) {
            //to ensure that a user can only delete their own transactions
            return res.status(401).json({ message: 'Not authorized' });
        }
        await transaction.deleteOne();
        res.json({ message: 'Transaction removed' });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Server Error while deleting." });
    }
};

const getSummary = async (req, res) => {
    try {
        const summary = await Transaction.aggregate([
            { $match: { user: req.user._id, type: 'expense' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);
        const expensesByCategory = summary.reduce((acc, item) => {
            acc[item._id] = item.total;
            return acc;
        }, {});
        res.json({ expenses_by_category: expensesByCategory });
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({ message: 'Server error while getting summary.' });
    }
};

//multer used to handle file upload
//in pdf, uses pdf-parse to extract data dtrectly
//image-> uses sharp to preprocess the image
//tesseract.js to perform OCR
//regular expressions to find store name and total amount
const uploadReceipt = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No receipt file was uploaded.' });
    }

    try {
        let text = '';
        
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdf(req.file.buffer);
            text = data.text;
        } else {
            const worker = await createWorker('eng');
            const processedImageBuffer = await sharp(req.file.buffer)
                .grayscale().normalize().toBuffer();
            const { data } = await worker.recognize(processedImageBuffer);
            text = data.text;
            await worker.terminate();
        }
        
        const cleanedText = text.trim().replace(/\r\n/g, '\n').split('\n').filter(line => line.trim().length > 0).join('\n');
        const words = cleanedText.split(/\s+/);
        const storeName = words.length >= 2 ? `${words[0]} ${words[1]}` : "Scanned from receipt";
        
        const match = text.match(/(?:total|amount due|balance)[\s\S]*?(\d+\.\d{2})/i);

        if (match && match[1]) {
            res.json({ amount: parseFloat(match[1]), description: storeName });
        } else {
            res.status(422).json({ message: 'Could not automatically find a total. Please enter it manually.' });
        }
    } catch (error) {
        console.error("Error processing receipt:", error);
        res.status(500).json({ message: "An error occurred during receipt processing." });
    }
};

module.exports = {
    addTransaction, getTransactions, getSummary, uploadReceipt, upload,
    updateTransaction, deleteTransaction
}; 