const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');

//create JWT for a user
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',   //token expires in 30 days
    });
};

//User registration
const registerUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
         return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'User with that username already exists' });
    }

    const user = await User.create({ username, password });

    if (user) {
        //on successful registration, send back user info and a token.
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

//user login
//finds user, matches passrowd
//if successful, creates new JWT
//JWT here contains user ID
const authUser = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

module.exports = { registerUser, authUser };