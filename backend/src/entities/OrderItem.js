const { EntitySchema } = require("typeorm");

// Define the OrderItem entity
const OrderItemEntity = new EntitySchema({
    name: "OrderItem",
    tableName: "order_items",
    columns: {
        id: { primary: true, type: "int", generated: true },
        productName: { type: "varchar", nullable: false },
        productPrice: { type: "float", nullable: false },
        quantity: { type: "int", nullable: false, default: 1 }
    },
    relations: {
        order: {
            type: "many-to-one",
            target: "Order",
            joinColumn: true,
            onDelete: "CASCADE"
        }
    }
});

module.exports = OrderItemEntity;