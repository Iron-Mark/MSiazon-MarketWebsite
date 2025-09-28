const AppDataSource = require('../config/database');
const S3Service = require('./S3Service');

class ProductService {
    constructor() {
        this.productRepository = null;
        this.s3Service = new S3Service();

        // Fallback in-memory storage
        this.inMemoryProducts = [
            { id: 1, name: "Strawberry Macaroon", price: 3.00, image: "strawberry.jpg" },
            { id: 2, name: "Chocolate Macaroon", price: 2.50, image: "chocolate.jpg" },
            { id: 3, name: "Candy Macaroon", price: 2.75, image: "candy.jpg" },
            { id: 4, name: "Berry Macaroon", price: 3.00, image: "berry.jpg" },
            { id: 5, name: "Caramel Macaroon", price: 2.50, image: "caramel.jpg" },
            { id: 6, name: "Orange Macaroon", price: 2.50, image: "orange.jpg" }
        ];

        this.useDatabase = false;
    }

    initialize() {
        try {
            if (AppDataSource.isInitialized) {
                this.productRepository = AppDataSource.getRepository("Product");
                this.useDatabase = true;
                console.log('✅ ProductService initialized with database');
            } else {
                console.log('⚠️ ProductService initialized with in-memory storage');
                this.useDatabase = false;
            }
        } catch (error) {
            console.error('❌ ProductService initialization failed, using in-memory storage:', error.message);
            this.useDatabase = false;
        }
    }

    // Add image URLs to products
    addImageUrls(products) {
        return products.map(product => ({
            ...product,
            imageUrl: this.s3Service.getImageUrl(product.image)
        }));
    }

    async getAllProducts() {
        try {
            if (this.useDatabase && this.productRepository) {
                const products = await this.productRepository.find();
                return this.addImageUrls(products);
            } else {
                return this.addImageUrls(this.inMemoryProducts);
            }
        } catch (error) {
            console.error('❌ Error getting products from database, falling back to in-memory:', error.message);
            return this.addImageUrls(this.inMemoryProducts);
        }
    }

    async getProductById(id) {
        try {
            if (this.useDatabase && this.productRepository) {
                const product = await this.productRepository.findOneBy({ id });
                return product ? this.addImageUrls([product])[0] : null;
            } else {
                const product = this.inMemoryProducts.find(p => p.id == id);
                return product ? this.addImageUrls([product])[0] : null;
            }
        } catch (error) {
            console.error('❌ Error getting product by ID from database, falling back to in-memory:', error.message);
            const product = this.inMemoryProducts.find(p => p.id == id);
            return product ? this.addImageUrls([product])[0] : null;
        }
    }

    async createProduct(productData) {
        try {
            if (this.useDatabase && this.productRepository) {
                const product = await this.productRepository.save(productData);
                return this.addImageUrls([product])[0];
            } else {
                const newId = Math.max(...this.inMemoryProducts.map(p => p.id)) + 1;
                const newProduct = { id: newId, ...productData };
                this.inMemoryProducts.push(newProduct);
                return this.addImageUrls([newProduct])[0];
            }
        } catch (error) {
            console.error('❌ Error creating product in database, falling back to in-memory:', error.message);
            const newId = Math.max(...this.inMemoryProducts.map(p => p.id)) + 1;
            const newProduct = { id: newId, ...productData };
            this.inMemoryProducts.push(newProduct);
            return this.addImageUrls([newProduct])[0];
        }
    }

    async updateProduct(id, productData) {
        try {
            if (this.useDatabase && this.productRepository) {
                await this.productRepository.update(id, productData);
                return await this.getProductById(id);
            } else {
                const index = this.inMemoryProducts.findIndex(p => p.id == id);
                if (index !== -1) {
                    this.inMemoryProducts[index] = { ...this.inMemoryProducts[index], ...productData };
                    return this.addImageUrls([this.inMemoryProducts[index]])[0];
                }
                return null;
            }
        } catch (error) {
            console.error('❌ Error updating product in database, falling back to in-memory:', error.message);
            const index = this.inMemoryProducts.findIndex(p => p.id == id);
            if (index !== -1) {
                this.inMemoryProducts[index] = { ...this.inMemoryProducts[index], ...productData };
                return this.addImageUrls([this.inMemoryProducts[index]])[0];
            }
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            if (this.useDatabase && this.productRepository) {
                return await this.productRepository.delete(id);
            } else {
                const index = this.inMemoryProducts.findIndex(p => p.id == id);
                if (index !== -1) {
                    this.inMemoryProducts.splice(index, 1);
                    return { affected: 1 };
                }
                return { affected: 0 };
            }
        } catch (error) {
            console.error('❌ Error deleting product from database, falling back to in-memory:', error.message);
            const index = this.inMemoryProducts.findIndex(p => p.id == id);
            if (index !== -1) {
                this.inMemoryProducts.splice(index, 1);
                return { affected: 1 };
            }
            return { affected: 0 };
        }
    }

    async seedDefaultProducts() {
        try {
            if (this.useDatabase && this.productRepository) {
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
                    console.log("✅ Seeded default products to database");
                }
            } else {
                console.log("✅ Using default in-memory products (no seeding needed)");
            }
        } catch (error) {
            console.error('❌ Error seeding products to database:', error.message);
            console.log("✅ Fallback: Using default in-memory products");
        }
    }
}

module.exports = ProductService;