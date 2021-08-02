const express = require('express');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getProductToWishList
} = require('../controllers/products');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/wish-list', protect, getProductToWishList);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
