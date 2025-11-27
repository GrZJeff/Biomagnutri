const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProducts);
router.post('/', protect, createProduct);

module.exports = router;