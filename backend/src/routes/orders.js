const express = require('express');
const OrderController = require('../controllers/OrderController');

const router = express.Router();
const orderController = new OrderController();

// Initialize the controller
orderController.initialize();

// Routes
router.get('/', (req, res) => orderController.getAllOrders(req, res));
router.get('/:id', (req, res) => orderController.getOrderById(req, res));
router.post('/', (req, res) => orderController.createOrder(req, res));
router.put('/:id/status', (req, res) => orderController.updateOrderStatus(req, res));
router.delete('/:id', (req, res) => orderController.deleteOrder(req, res));

module.exports = router;