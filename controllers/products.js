const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrRes = require('../utils/errRes');
const filterEl = require('../utils/filterElement');

// @desc   Get All Product
// @route  GET /api/v1/products
// @access Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  let query;

  const params = {};

  if (req.query.gender) {
    params.gender = req.query.gender;
  }

  if (req.query.category && req.query.category !== 'new') {
    params.category = req.query.category;
  }

  if (req.query.brand) {
    const brandFields = req.query.brand.split(',');
    const brands = { $in: brandFields };
    params.brand = brands;
  }
  if (req.query.color) {
    const colorFields = req.query.color.split(',');
    const color = { $in: colorFields };
    params.availableColor = color;
  }
  if (req.query.size) {
    const sizeFields = req.query.size.split(',');
    const size = { $in: sizeFields };
    params.size = size;
  }
  if (req.query.productType) {
    const productTypeAndCategoryFields = req.query.productType.split('-');
    const productType = productTypeAndCategoryFields[1];
    const category = productTypeAndCategoryFields[0];
    params.productType = productType;
    params.category = category;
  }

  if (req.query.priceRange) {
    const priceRangeFields = req.query.priceRange.split(',');
    const minPrice = +priceRangeFields[0] * 1000;
    const maxPrice = +priceRangeFields[1] * 1000;
    const price = { $gte: minPrice, $lte: maxPrice };
    params.price = price;
  }

  query = Product.find(params);

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort;
    let sort;
    if (sortBy === 'newProduct') {
      sort = '-createdAt';
    }

    if (sortBy === 'priceHighToLow') {
      sort = '-price';
    }

    if (sortBy === 'priceLowToHigh') {
      sort = 'price';
    }

    query = query.sort(sort);
  } else {
    query = query.sort('-createdAt');
  }

  const page = +req.query.page || 1;
  const limit = +req.query.limit || 20;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.where(params).countDocuments();

  const productsForFilter = await query;

  const filterElements = filterEl(productsForFilter);

  query = query.skip(skip).limit(limit);

  const products = await query;

  const pagination = {
    total
  };

  if (endIndex < total) {
    pagination.next = {
      page: page + 1
    };
  }

  res.status(200).json({
    success: true,
    filterElements,
    count: products.length,
    pagination,
    data: products
  });
});

// @desc   Get Single Product By Id
// @route  GET /api/v1/products/:id
// @access Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrRes(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  product.watchCount++;

  const { productType, gender, category } = product;

  const options = { productType, gender, category };

  const randomInt = Math.random();

  const randomSort = randomInt > 0.5 ? -1 : 1;

  const similarProducts = await Product.find(options)
    .sort({ $natural: randomSort })
    .limit(6);

  similarProducts.sort((a, b) => 0.5 - Math.random());

  const productIndex = similarProducts.findIndex(
    (product) => product._id.toString() === req.params.id.toString()
  );
  if (productIndex !== -1) {
    similarProducts.splice(productIndex, 1);
  } else {
    similarProducts.splice(similarProducts.length - 1, 1);
  }

  await product.save();
  res.status(200).json({
    success: true,
    data: product,
    similarProducts
  });
});

// @desc   Get products to wish list
// @route  GET /api/v1/products/wish-list
// @access Private

exports.getProductToWishList = asyncHandler(async (req, res, next) => {
  const wishList = req.user.wishList;

  const product = await Product.find({
    _id: {
      $in: wishList
    }
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc   Create new Product
// @route  POST /api/v1/products
// @access Private (admin only)
exports.createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc   Update  Product
// @route  PUT /api/v1/products
// @access Private (admin only)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrRes(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc   Delete  Product By Id
// @route  DELETE /api/v1/products/:id
// @access Private (admin only)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrRes(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  product.remove();
  res.status(200).json({
    success: true,
    data: {}
  });
});
