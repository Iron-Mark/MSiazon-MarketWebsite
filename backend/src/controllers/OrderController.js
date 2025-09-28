const OrderService = require('../services/OrderService');

class OrderController {
    constructor() {
        this.orderService = new OrderService();
    }

    initialize() {
        this.orderService.initialize();
    }

    async getAllOrders(req, res) {
        try {
            const orders = await this.orderService.getAllOrders();
            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching orders",
                error: error.message
            });
        }
    }

    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await this.orderService.getOrderById(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error("Error fetching order:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching order",
                error: error.message
            });
        }
    }

    async createOrder(req, res) {
        try {
            const { name, address, cartItems } = req.body;

            if (!name || !address || !cartItems || cartItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields: name, address, and cartItems"
                });
            }

            const order = await this.orderService.createOrder({ name, address, cartItems });

            res.status(201).json({
                success: true,
                data: order,
                message: "Order created successfully"
            });
        } catch (error) {
            console.error("Error creating order:", error);
            res.status(500).json({
                success: false,
                message: "Error creating order",
                error: error.message
            });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await this.orderService.updateOrderStatus(id, status);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            res.json({
                success: true,
                data: order,
                message: "Order status updated successfully"
            });
        } catch (error) {
            console.error("Error updating order:", error);
            res.status(500).json({
                success: false,
                message: "Error updating order",
                error: error.message
            });
        }
    }

    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            await this.orderService.deleteOrder(id);

            res.json({
                success: true,
                message: "Order deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting order:", error);
            res.status(500).json({
                success: false,
                message: "Error deleting order",
                error: error.message
            });
        }
    }
}

module.exports = OrderController;