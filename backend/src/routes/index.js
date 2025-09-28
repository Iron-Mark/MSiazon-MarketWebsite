const express = require('express');
const productRoutes = require('./products');
const orderRoutes = require('./orders');

const router = express.Router();

// API Routes
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: "API is healthy",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;