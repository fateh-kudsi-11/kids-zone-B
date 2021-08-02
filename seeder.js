const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load models
import Product from './models/Product.js';

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect DataBase
mongoose.connect(process.env.MONG_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read JSON file
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/boysTopsProducts.json`, 'utf8')
);

// Import Data
const importData = async () => {
  try {
    await Product.create(products);
    console.log('Data Imported....'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed....'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
