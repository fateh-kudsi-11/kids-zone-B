const User = require('../models/User.js');
const Product = require('../models/Product.js');
const ErrRes = require('../utils/errRes.js');
const asyncHandler = require('../middleware/async.js');

// @desc Get Register user
// @route POST /api/v2/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  const token = user.getSignedJwtToken();
  res.status(201).json({ token });
});

// @desc   Get Login user
// @route  POST /api/v2/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrRes(`Please provide an email and password`, 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrRes(`Invalid credentails`, 401));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrRes(`Invalid credentails`, 401));
  }
  const token = user.getSignedJwtToken();
  res.status(200).json({ token });
});

// @desc   Get Current logged in user
// @route  GET /api/v2/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    data: user
  });
});

// @desc   Update user profile
// @route  POST /api/v2/auth/update-user
// @access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    data: user
  });
});

// @desc   Update User Password
// @route  POST /api/v2/auth/update-password
// @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(
      new ErrRes(`Please provide an current password and new password`, 400)
    );
  }
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new ErrRes(`Invalid credentails`, 401));
  }
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrRes(`Invalid credentails`, 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true
  });
});

// @desc   Add new Adress book
// @route  POST /api/v2/auth/adress-book
// @access Private
exports.updateAdressBook = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const { firstName, lastName, mobile, country, city, address, postcode } =
    req.body;
  const newAdress = {
    firstName,
    lastName,
    mobile,
    country,
    city,
    address,
    postcode
  };
  user.adressBooks.unshift(newAdress);

  await user.save();

  res.status(200).json({
    data: user
  });
});

// @desc   Delete Adress book
// @route  DELETE /api/v2/auth/adress-book/:_id
// @access Private
exports.deleteAdressBook = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const adressBooks = user.adressBooks;

  const adressToDelete = adressBooks.findIndex(
    (e) => e._id.toString() === req.params._id
  );
  adressBooks.splice(adressToDelete, 1);

  user.adressBooks = adressBooks;

  await user.save();

  res.status(200).json({
    data: user
  });
});

// @desc   Add Product to Wish List
// @route  POST /api/v2/auth/wish-list/:id
// @access Private
exports.updatePaymentMethods = asyncHandler(async (req, res, next) => {
  const user = req.user;

  let status;

  const wishList = user.wishList;

  const wishListIndex = wishList.findIndex((wish) => {
    return wish.toString() === req.params.id;
  });
  if (wishListIndex === -1) {
    user.wishList.unshift(req.params.id);
    status = 'ADD';
  } else {
    user.wishList.splice(wishListIndex, 1);
    status = 'REMOVE';
  }
  await user.save();

  res.status(200).json({
    data: user,
    status
  });
});

// @desc   Add Product to Cart
// @route  POST /api/v2/auth/cart
// @access Private
exports.deletePaymentMethods = asyncHandler(async (req, res, next) => {
  const { productId, selectedColor, selectedSize } = req.body;

  const user = req.user;

  const product = await Product.findById(productId);

  const isProductEx = user.cart.findIndex(
    (product) => product.productId.toString() === productId.toString()
  );

  if (isProductEx !== -1) {
    return res.status(200).json({
      data: user
    });
  }

  const { productName, images, price, size, colors } = product;

  const productCart = {
    productId,
    productName,
    images,
    price,
    sizes: size,
    colors,
    selectedColor: selectedColor,
    selectedSize: selectedSize
  };
  user.cart.unshift(productCart);

  await user.save();

  res.status(201).json({
    data: user
  });
});

// @desc   Update Product  Cart
// @route  PUT /api/v2/auth/cart/:id
// @access Private
exports.updateProductCart = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { cart } = user;

  const { color, size, selectQty } = req.body;

  const productToUpdate = cart.findIndex(
    (product) => product.productId.toString() === req.params._id.toString()
  );

  if (productToUpdate === -1) {
    return next(new ErrRes(`Invalid credentails`, 401));
  }

  cart[productToUpdate].selectedColor = color;
  cart[productToUpdate].selectedSize = size;
  cart[productToUpdate].qty = selectQty;

  user.cart = cart;

  await user.save();

  res.status(200).json({
    data: user
  });
});

// @desc   Delete Product from Cart
// @route  DELETE /api/v2/auth/cart/:id
// @access Private
exports.deleteProductFromCart = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { cart } = user;

  const productToDelete = cart.findIndex(
    (product) => product.productId.toString() === req.params._id.toString()
  );

  if (productToDelete === -1) {
    return next(new ErrRes(`Invalid credentails`, 401));
  }
  user.cart.splice(productToDelete, 1);

  await user.save();

  res.status(200).json({
    data: user
  });
});

// @desc   Add Product to Wish List
// @route  POST /api/v1/auth/wish-list/:id
// @access Private
exports.addProductToWishList = asyncHandler(async (req, res, next) => {
  const user = req.user;

  let status;

  const wishList = user.wishList;

  const wishListIndex = wishList.findIndex((wish) => {
    return wish.toString() === req.params.id;
  });
  if (wishListIndex === -1) {
    user.wishList.unshift(req.params.id);
    status = 'ADD';
  } else {
    user.wishList.splice(wishListIndex, 1);
    status = 'REMOVE';
  }
  await user.save();

  res.status(200).json({
    data: user,
    status
  });
});

// @desc   Add Product to Cart
// @route  POST /api/v1/auth/cart
// @access Private
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, selectedColor, selectedSize } = req.body;

  const user = req.user;

  const product = await Product.findById(productId);

  const isProductEx = user.cart.findIndex(
    (product) => product.productId.toString() === productId.toString()
  );

  if (isProductEx !== -1) {
    return res.status(200).json({
      data: user
    });
  }

  const { productName, images, price, size, colors } = product;

  const productCart = {
    productId,
    productName,
    images,
    price,
    sizes: size,
    colors,
    selectedColor: selectedColor,
    selectedSize: selectedSize
  };
  user.cart.unshift(productCart);

  await user.save();

  res.status(201).json({
    data: user
  });
});
