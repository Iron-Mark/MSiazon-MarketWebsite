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
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001; // Different port from frontend

// Middleware (dynamic CORS)
app.use(express.json());
// Dynamic CORS handling: No hard-coded public IPs so an Elastic IP or domain change does not require code edits.
// Provide a comma-separated list in CORS_ORIGINS (e.g. https://app.example.com,https://admin.example.com)
// For local development localhost origins are always allowed.
const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080'
];

let extraOrigins = [];
if (process.env.CORS_ORIGINS) {
    extraOrigins = process.env.CORS_ORIGINS
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
}
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...extraOrigins])];

// Optional: allow any origin (NOT recommended for production) by setting CORS_ALLOW_ALL=true
const allowAll = (process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true';

app.use(cors({
    origin: function (origin, callback) {
        if (allowAll) return callback(null, true);
        // Allow non-browser tools (no origin) and any whitelisted origin
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        console.warn('[CORS] Blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// API Routes
app.use('/api', apiRoutes);

// Optional: serve frontend from the same backend process (set SERVE_FRONTEND=false to disable)
if ((process.env.SERVE_FRONTEND || 'true').toLowerCase() !== 'false') {
    const frontendDir = path.join(__dirname, '..', 'frontend');
    if (fs.existsSync(frontendDir)) {
        console.log('[Frontend] Serving static files from', frontendDir);
        app.use(express.static(frontendDir));

        // SPA fallback: for non-API routes that do not map to a file, return index.html
        app.get(["/products", "/cart", "/checkout", "/home", "/"], (req, res, next) => {
            // If a file actually exists for the path, let static middleware handle it
            const requested = path.join(frontendDir, req.path);
            if (fs.existsSync(requested) && fs.statSync(requested).isFile()) return next();
            const indexFile = path.join(frontendDir, 'index.html');
            if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
            return next();
        });
    } else {
        console.warn('[Frontend] Frontend directory not found; skipping static serving');
    }
}

// Convenience: /api root summary
app.get('/api', (req, res) => {
    res.json({
        success: true,
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            orders: '/api/orders'
        }
    });
});

// Root info JSON (under /_info to avoid colliding with frontend index)
app.get('/_info', (req, res) => {
    res.json({
        success: true,
        message: "Macaroon Market API",
        health: "/api/health",
        products: "/api/products",
        orders: "/api/orders",
        docs: "Add documentation link or README URL here",
        version: process.env.npm_package_version || '1.0.0'
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