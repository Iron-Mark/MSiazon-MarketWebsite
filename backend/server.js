// Load environment variables. Attempt project root first, then backend folder.
// This lets the app work whether .env is at /MSiazon-MarketWebsite/.env (preferred)
// or accidentally placed at /MSiazon-MarketWebsite/backend/.env.
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch (_) { }
try { require('dotenv').config({ path: path.join(__dirname, '.env') }); } catch (_) { }
const express = require('express');
const cors = require('cors');
const AppDataSource = require('./src/config/database');
const S3Service = require('./src/services/S3Service');
const ProductService = require('./src/services/ProductService');
const apiRoutes = require('./src/routes');

const app = express();
const port = process.env.PORT || 3001; // Different port from frontend

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://13.250.9.40', 'http://13.250.9.40:3000', 'http://13.250.9.40:8080', 'http://54.169.187.175.40:3000', 'http://54.169.187.175.40:8080'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
// Dynamic CORS handling: allow list can be extended via CORS_ORIGINS env (comma separated)
// Existing static origins retained + new public IP (update automatically if you attach an Elastic IP or domain)
const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://13.250.9.40',
    'http://13.250.9.40:3000',
    'http://13.250.9.40:8080',
    'http://54.169.187.175',
    'http://54.169.187.175:3000',
    'http://54.169.187.175:8080'
];

let extraOrigins = [];
if (process.env.CORS_ORIGINS) {
    extraOrigins = process.env.CORS_ORIGINS
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
}
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...extraOrigins])];

app.use(cors({
    origin: function (origin, callback) {
        // Allow non-browser tools (no origin) and any whitelisted origin
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn('Blocked by CORS origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

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
        console.log('🚀 Starting Mark Siazon\'s Macaroon Market Backend...');

        // Upload static files to S3 (optional, continue on error)
        try {
            const s3Service = new S3Service();
            await s3Service.uploadStaticFilesToS3();
            console.log('✅ S3 upload completed');
        } catch (s3Error) {
            console.warn('⚠️ S3 upload failed, continuing without S3:', s3Error.message);
        }

        // Initialize database connection with retry logic and fallback
        let databaseConnected = false;
        let retryCount = 0;
        const maxRetries = 2; // Reduced retries for faster fallback

        while (retryCount < maxRetries && !databaseConnected) {
            try {
                console.log(`📡 Attempting database connection (attempt ${retryCount + 1}/${maxRetries})...`);
                await AppDataSource.initialize();
                console.log('✅ Database connected successfully');
                databaseConnected = true;
                break;
            } catch (dbError) {
                retryCount++;
                console.error(`❌ Database connection failed (attempt ${retryCount}):`, dbError.message);

                if (retryCount >= maxRetries) {
                    console.warn('⚠️ Database connection failed after all retries, falling back to in-memory storage');
                    console.log('📝 Note: Data will not be persisted between server restarts');
                    break;
                }

                // Wait before retry (shorter wait)
                console.log('⏳ Waiting 3 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // Initialize services (works with or without database)
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