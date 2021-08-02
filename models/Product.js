const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  colorName: {
    type: String,
    required: true
  },
  colorCode: {
    type: String,
    required: true
  }
});

const ImagesSchema = new mongoose.Schema({
  imagesColor: {
    type: String,
    required: true
  },
  images: {
    type: Array,
    required: true
  }
});

const ProductSchema = new mongoose.Schema({
  gender: {
    type: String,
    required: [true, 'Please add Gender'],
    enum: ['boys', 'girls', 'baibes']
  },
  productName: {
    type: String,
    required: [true, 'Please add a Product Name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  brand: {
    required: [true, 'Please add a brand'],
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },

  size: {
    type: [String],
    required: [true, 'Please add a sizes']
  },
  availableColor: {
    type: [String],
    required: [true, 'Please add an available Color']
  },
  colors: [ColorSchema],
  images: [ImagesSchema],
  description: {
    type: String,
    required: [true, 'please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  details: {
    required: [true, 'Please add a details'],
    type: [String]
  },
  category: {
    type: String,
    required: [true, 'Please add a Category']
  },
  productType: {
    type: String,
    required: [true, 'Please add a Product Type']
  },
  productNumber: {
    type: Number,
    required: [true, 'Please add a Product Number']
  },

  createAt: {
    type: Date,
    default: Date.now()
  },
  watchCount: {
    type: Number,
    default: 0
  }
  // @to do CreateBy
});

module.exports = mongoose.model('Product', ProductSchema);
