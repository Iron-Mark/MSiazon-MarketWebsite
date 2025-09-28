require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AppDataSource = require('./src/config/database');
const S3Service = require('./src/services/S3Service');
const ProductService = require('./src/services/ProductService');
const apiRoutes = require('./src/routes');

const app = express();
const port = process.env.PORT || 3001; // Different port from frontend

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

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

// Initialize services and start server
async function startServer() {
    try {
        // Upload static files to S3
        const s3Service = new S3Service();
        await s3Service.uploadStaticFilesToS3();
        console.log('✅ S3 upload completed');

        // Initialize database connection
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        // Seed default products
        const productService = new ProductService();
        productService.initialize();
        await productService.seedDefaultProducts();

        // Start server
        app.listen(port, () => {
            console.log(`🚀 Backend server running on http://localhost:${port}`);
            console.log(`📊 API endpoints available at http://localhost:${port}/api`);
            console.log(`🏥 Health check: http://localhost:${port}/api/health`);
        });

    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

startServer();