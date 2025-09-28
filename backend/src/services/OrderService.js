const AppDataSource = require('../config/database');

class OrderService {
    constructor() {
        this.orderRepository = null;
    }

    initialize() {
        this.orderRepository = AppDataSource.getRepository("Order");
    }

    async getAllOrders() {
        return await this.orderRepository.find({
            relations: ["orderItems"]
        });
    }

    async getOrderById(id) {
        return await this.orderRepository.findOne({
            where: { id },
            relations: ["orderItems"]
        });
    }

    async createOrder(orderData) {
        const { name, address, cartItems } = orderData;
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = {
            name,
            address,
            total,
            orderItems: cartItems.map(item => ({
                productName: item.name,
                productPrice: item.price,
                quantity: item.quantity
            }))
        };

        return await this.orderRepository.save(order);
    }

    async updateOrderStatus(id, status) {
        await this.orderRepository.update(id, { status });
        return await this.getOrderById(id);
    }

    async deleteOrder(id) {
        return await this.orderRepository.delete(id);
    }
}

module.exports = OrderService;