const express = require('express');
const ProductController = require('../controllers/ProductController');

const router = express.Router();
const productController = new ProductController();

// Initialize the controller
productController.initialize();

// Routes
router.get('/', (req, res) => productController.getAllProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));
router.post('/', (req, res) => productController.createProduct(req, res));
router.put('/:id', (req, res) => productController.updateProduct(req, res));
router.delete('/:id', (req, res) => productController.deleteProduct(req, res));

module.exports = router;