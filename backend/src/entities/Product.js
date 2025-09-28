const { EntitySchema } = require("typeorm");

// Define the Product entity with a new "image" field.
const ProductEntity = new EntitySchema({
    name: "Product",
    tableName: "products",
    columns: {
        id: { primary: true, type: "int", generated: true },
        name: { type: "varchar", nullable: false },
        price: { type: "float", nullable: false },
        image: { type: "varchar", nullable: false }
    }
});

module.exports = ProductEntity;