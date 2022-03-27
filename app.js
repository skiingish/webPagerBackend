require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
var cors = require('cors');
var logger = require('morgan');

const app = express();

// Connect Database
connectDB();

// Don't show the log in test.
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

// Init middleware
app.use(express.json({ extended: false }));

//To allow cross-origin requests
app.use(cors());

// Default Route.
app.get('/', (req, res) => res.send('YEWW you found me'));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/order', require('./routes/api/order'));

// Export app
module.exports = app;
