const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const transactionSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    //line above creates relationship between Transaction and User models
    //links each transaction to the user who makes it
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
}, { 
    timestamps: true
    //adds createdAt and updatedAt fields in each transaction
    //useful for sorting 
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;