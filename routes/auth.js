const express = require('express');

const {
  register,
  login,
  updateUser,
  getMe,
  updatePassword,
  updateAdressBook,
  deleteAdressBook,
  addProductToWishList,
  addProductToCart,
  updateProductCart,
  deleteProductFromCart
} = require('../controllers/auth.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.get('/me', protect, getMe);
router.post('/register', register);
router.post('/login', login);
router.post('/update-user', protect, updateUser);
router.post('/update-password', protect, updatePassword);
router.post('/adress-book', protect, updateAdressBook);
router.delete('/adress-book/:_id', protect, deleteAdressBook);
router.post('/wish-list/:id', protect, addProductToWishList);
router.post('/cart', protect, addProductToCart);
router.put('/cart/:_id', protect, updateProductCart);
router.delete('/cart/:_id', protect, deleteProductFromCart);

module.exports = router;
