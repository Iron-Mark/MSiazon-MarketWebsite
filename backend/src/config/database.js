require('dotenv').config();
require("reflect-metadata");
const { DataSource } = require("typeorm");
const fs = require("fs");
const path = require("path");

// Import entities
const ProductEntity = require('../entities/Product');
const OrderEntity = require('../entities/Order');
const OrderItemEntity = require('../entities/OrderItem');

// Configure the data source for MySQL using TypeORM
const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    ssl: (process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com')) ? {
        ca: fs.readFileSync(path.join(__dirname, '../../../global-bundle.pem')).toString()
    } : false,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "mikes_macaroon_market",
    synchronize: true, // Automatically syncs the schema (not recommended for production)
    logging: process.env.NODE_ENV === 'development',
    entities: [ProductEntity, OrderEntity, OrderItemEntity]
});

module.exports = AppDataSource;