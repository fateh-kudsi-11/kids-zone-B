const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const errorHandler = require('./middleware/errorHandler.js');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

// Load Route
const product = require('./routes/products.js');
const auth = require('./routes/auth.js');

// Init app
const app = express();

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load DataBase
connectDB();

// Body parser
app.use(express.json({ extened: false }));

// cors
app.use(cors());

app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routes
app.use('/api/v2/products', product);
app.use('/api/v2/auth', auth);

// Set static folder
app.use(express.static('public'));

// Custom Express Erorrs Handleing
app.use(errorHandler);

const PORT = process.env.PORT || 6000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode  on port ${PORT}`.cyan
      .inverse
  )
);

// Handle unhandled Promise rejections

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error:${err.message}`.red);
  // Close server & Exit Process
  server.close(() => process.exit(1));
});
