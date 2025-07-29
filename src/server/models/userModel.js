const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    categories: { 
        type: [String], //array of items ya categories jo user add karega
        default: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Salary', 'Other'] 
    },
}, { timestamps: true });


//used to compare hashed password and stored password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//used to hash the password
//bcrypt.hash() hashes the password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;