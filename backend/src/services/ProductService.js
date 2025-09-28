const AppDataSource = require('../config/database');

class ProductService {
    constructor() {
        this.productRepository = null;
    }

    initialize() {
        this.productRepository = AppDataSource.getRepository("Product");
    }

    async getAllProducts() {
        return await this.productRepository.find();
    }

    async getProductById(id) {
        return await this.productRepository.findOneBy({ id });
    }

    async createProduct(productData) {
        return await this.productRepository.save(productData);
    }

    async updateProduct(id, productData) {
        await this.productRepository.update(id, productData);
        return await this.getProductById(id);
    }

    async deleteProduct(id) {
        return await this.productRepository.delete(id);
    }

    async seedDefaultProducts() {
        const count = await this.productRepository.count();
        if (count === 0) {
            const defaultProducts = [
                { name: "Strawberry Macaroon", price: 3.00, image: "strawberry.jpg" },
                { name: "Chocolate Macaroon", price: 2.50, image: "chocolate.jpg" },
                { name: "Candy Macaroon", price: 2.75, image: "candy.jpg" },
                { name: "Berry Macaroon", price: 3.00, image: "berry.jpg" },
                { name: "Caramel Macaroon", price: 2.50, image: "caramel.jpg" },
                { name: "Orange Macaroon", price: 2.50, image: "orange.jpg" }
            ];

            for (const prod of defaultProducts) {
                await this.productRepository.save(prod);
            }
            console.log("Inserted default products.");
        }
    }
}

module.exports = ProductService;