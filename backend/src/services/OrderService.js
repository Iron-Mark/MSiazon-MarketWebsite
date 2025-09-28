const AppDataSource = require('../config/database');

class OrderService {
    constructor() {
        this.orderRepository = null;
        this.inMemoryOrders = [];
        this.orderIdCounter = 1;
        this.useDatabase = false;
    }

    initialize() {
        try {
            if (AppDataSource.isInitialized) {
                this.orderRepository = AppDataSource.getRepository("Order");
                this.useDatabase = true;
                console.log('✅ OrderService initialized with database');
            } else {
                console.log('⚠️ OrderService initialized with in-memory storage');
                this.useDatabase = false;
            }
        } catch (error) {
            console.error('❌ OrderService initialization failed, using in-memory storage:', error.message);
            this.useDatabase = false;
        }
    }

    async getAllOrders() {
        try {
            if (this.useDatabase && this.orderRepository) {
                return await this.orderRepository.find({
                    relations: ["orderItems"]
                });
            } else {
                return this.inMemoryOrders;
            }
        } catch (error) {
            console.error('❌ Error getting orders from database, falling back to in-memory:', error.message);
            return this.inMemoryOrders;
        }
    }

    async getOrderById(id) {
        try {
            if (this.useDatabase && this.orderRepository) {
                return await this.orderRepository.findOne({
                    where: { id },
                    relations: ["orderItems"]
                });
            } else {
                return this.inMemoryOrders.find(order => order.id == id);
            }
        } catch (error) {
            console.error('❌ Error getting order by ID from database, falling back to in-memory:', error.message);
            return this.inMemoryOrders.find(order => order.id == id);
        }
    }

    async createOrder(orderData) {
        const { name, address, cartItems } = orderData;
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = {
            name,
            address,
            total,
            status: 'pending',
            createdAt: new Date(),
            orderItems: cartItems.map(item => ({
                productName: item.name,
                productPrice: item.price,
                quantity: item.quantity
            }))
        };

        try {
            if (this.useDatabase && this.orderRepository) {
                return await this.orderRepository.save(order);
            } else {
                order.id = this.orderIdCounter++;
                this.inMemoryOrders.push(order);
                return order;
            }
        } catch (error) {
            console.error('❌ Error creating order in database, falling back to in-memory:', error.message);
            order.id = this.orderIdCounter++;
            this.inMemoryOrders.push(order);
            return order;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            if (this.useDatabase && this.orderRepository) {
                await this.orderRepository.update(id, { status });
                return await this.getOrderById(id);
            } else {
                const order = this.inMemoryOrders.find(o => o.id == id);
                if (order) {
                    order.status = status;
                    return order;
                }
                return null;
            }
        } catch (error) {
            console.error('❌ Error updating order in database, falling back to in-memory:', error.message);
            const order = this.inMemoryOrders.find(o => o.id == id);
            if (order) {
                order.status = status;
                return order;
            }
            return null;
        }
    }

    async deleteOrder(id) {
        try {
            if (this.useDatabase && this.orderRepository) {
                return await this.orderRepository.delete(id);
            } else {
                const index = this.inMemoryOrders.findIndex(o => o.id == id);
                if (index !== -1) {
                    this.inMemoryOrders.splice(index, 1);
                    return { affected: 1 };
                }
                return { affected: 0 };
            }
        } catch (error) {
            console.error('❌ Error deleting order from database, falling back to in-memory:', error.message);
            const index = this.inMemoryOrders.findIndex(o => o.id == id);
            if (index !== -1) {
                this.inMemoryOrders.splice(index, 1);
                return { affected: 1 };
            }
            return { affected: 0 };
        }
    }
}

module.exports = OrderService;