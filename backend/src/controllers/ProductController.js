const ProductService = require('../services/ProductService');
const S3Service = require('../services/S3Service');

class ProductController {
    constructor() {
        this.productService = new ProductService();
        this.s3Service = new S3Service();
    }

    initialize() {
        this.productService.initialize();
    }

    async getAllProducts(req, res) {
        try {
            const products = await this.productService.getAllProducts();

            // Add image URLs to products
            const productsWithImages = products.map(product => ({
                ...product,
                imageUrl: this.s3Service.getImageUrl(product.image)
            }));

            res.json({
                success: true,
                data: productsWithImages
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching products",
                error: error.message
            });
        }
    }

    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await this.productService.getProductById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const productWithImage = {
                ...product,
                imageUrl: this.s3Service.getImageUrl(product.image)
            };

            res.json({
                success: true,
                data: productWithImage
            });
        } catch (error) {
            console.error("Error fetching product:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching product",
                error: error.message
            });
        }
    }

    async createProduct(req, res) {
        try {
            const productData = req.body;
            const product = await this.productService.createProduct(productData);

            res.status(201).json({
                success: true,
                data: product,
                message: "Product created successfully"
            });
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({
                success: false,
                message: "Error creating product",
                error: error.message
            });
        }
    }

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const productData = req.body;
            const product = await this.productService.updateProduct(id, productData);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.json({
                success: true,
                data: product,
                message: "Product updated successfully"
            });
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({
                success: false,
                message: "Error updating product",
                error: error.message
            });
        }
    }

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            await this.productService.deleteProduct(id);

            res.json({
                success: true,
                message: "Product deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({
                success: false,
                message: "Error deleting product",
                error: error.message
            });
        }
    }
}

module.exports = ProductController;