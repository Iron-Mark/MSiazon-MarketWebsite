const { EntitySchema } = require("typeorm");

// Define the Order entity
const OrderEntity = new EntitySchema({
    name: "Order",
    tableName: "orders",
    columns: {
        id: { primary: true, type: "int", generated: true },
        name: { type: "varchar", nullable: false },
        address: { type: "varchar", nullable: false },
        total: { type: "float", nullable: false },
        createdAt: { type: "timestamp", createDate: true }
    },
    relations: {
        orderItems: {
            type: "one-to-many",
            target: "OrderItem",
            inverseSide: "order",
            cascade: true
        }
    }
});

module.exports = OrderEntity;