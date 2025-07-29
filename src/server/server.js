const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 

connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Backend server is running on port ${PORT}`));