const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

//function to protect routes that require a user to be logged in
const protect = async (req, res, next) => {
    let token;
    //checks for a JWT in the Authorization header of the incoming request
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //get token from header
            token = req.headers.authorization.split(' ')[1];

            //verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //find user from the token ID and attach it to the request object
            //makes user info available in any protected route
            req.user = await User.findById(decoded.id).select('-password');

            //pass control to the controller function
            next();
        } catch (error) {
            console.error('Token verification failed', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
