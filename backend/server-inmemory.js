require('dotenv').config();
const express = require('express');
const cors = require('cors');
const S3Service = require('./src/services/S3Service');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for development
let products = [
    { id: 1, name: "Strawberry Macaroon", price: 3.00, image: "strawberry.jpg" },
    { id: 2, name: "Chocolate Macaroon", price: 2.50, image: "chocolate.jpg" },
    { id: 3, name: "Candy Macaroon", price: 2.75, image: "candy.jpg" },
    { id: 4, name: "Berry Macaroon", price: 3.00, image: "berry.jpg" },
    { id: 5, name: "Caramel Macaroon", price: 2.50, image: "caramel.jpg" },
    { id: 6, name: "Orange Macaroon", price: 2.50, image: "orange.jpg" }
];

let orders = [];
let orderIdCounter = 1;

// Initialize S3 service
const s3Service = new S3Service();

// Add image URLs to products
function addImageUrls(productList) {
    return productList.map(product => ({
        ...product,
        imageUrl: s3Service.getImageUrl(product.image)
    }));
}

// Routes
// Products
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        data: addImageUrls(products)
    });
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    res.json({
        success: true,
        data: addImageUrls([product])[0]
    });
});

// Orders
app.get('/api/orders', (req, res) => {
    res.json({
        success: true,
        data: orders
    });
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }
    res.json({
        success: true,
        data: order
    });
});

app.post('/api/orders', (req, res) => {
    try {
        const { name, address, cartItems } = req.body;

        if (!name || !address || !cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, address, and cartItems'
            });
        }

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = {
            id: orderIdCounter++,
            name,
            address,
            total,
            createdAt: new Date(),
            orderItems: cartItems.map(item => ({
                productName: item.name,
                productPrice: item.price,
                quantity: item.quantity
            }))
        };

        orders.push(order);
        console.log('New order created:', order);

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: "API is healthy (In-Memory Mode)",
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
async function startServer() {
    try {
        // Upload static files to S3
        await s3Service.uploadStaticFilesToS3();
        console.log('✅ S3 upload completed');

        // Start server
        app.listen(port, () => {
            console.log(`🚀 Backend server running on http://localhost:${port}`);
            console.log(`📊 API endpoints available at http://localhost:${port}/api`);
            console.log(`🏥 Health check: http://localhost:${port}/api/health`);
            console.log(`⚠️  Running in IN-MEMORY mode - data will not persist`);
        });

    } catch (error) {
        console.log('⚠️  S3 upload failed, starting without S3:', error.message);

        // Start server anyway
        app.listen(port, () => {
            console.log(`🚀 Backend server running on http://localhost:${port}`);
            console.log(`📊 API endpoints available at http://localhost:${port}/api`);
            console.log(`🏥 Health check: http://localhost:${port}/api/health`);
            console.log(`⚠️  Running in IN-MEMORY mode - data will not persist`);
            console.log(`⚠️  S3 integration disabled`);
        });
    }
}

startServer();