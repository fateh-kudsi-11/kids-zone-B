const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AdressBook = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  postcode: {
    type: String,
    required: true
  }
});

const ProductCart = new mongoose.Schema({
  productId: { type: mongoose.Schema.ObjectId, required: true },
  productName: { type: String, required: true },
  images: { type: Array },
  price: { type: Number, required: true },
  sizes: { type: Array },
  selectedSize: { type: String },
  colors: { type: Array },
  selectedColor: { type: String },
  qty: { type: Number, default: 1 }
});

const UserSchame = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Plesae add first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add last name']
  },
  title: {
    type: String,
    enum: ['mr', 'mrs', 'miss', 'ms', 'mx', 'dr']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Please add gender']
  },
  dateOfBirth: {
    type: String
  },

  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please use a vaild Email adrees'
    ]
  },

  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  adressBooks: [AdressBook],
  wishList: [
    {
      type: mongoose.Schema.ObjectId
    }
  ],
  cart: [ProductCart]
});

UserSchame.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchame.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

UserSchame.methods.matchPassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

module.exports = mongoose.model('User', UserSchame);
