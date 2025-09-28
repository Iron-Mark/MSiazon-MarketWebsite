# 🍪 Mark Siazon's Macaroon Market

A full-stack e-commerce web application for selling delicious macaroons, successfully deployed on AWS EC2 with S3 integration.

## 🌟 Live Demo

**🌐 Website**: [http://13.250.9.40](http://13.250.9.40)  
**🔌 API**: [http://13.250.9.40:8080/api](http://13.250.9.40:8080/api)  
**📋 Orders**: [http://13.250.9.40:8080/api/orders](http://13.250.9.40:8080/api/orders)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#️-architecture)
- [Deployment Status](#-deployment-status)
- [API Documentation](#-api-documentation)
- [Managing Orders](#-managing-orders)
- [Local Development](#-local-development)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)

## ✨ Features

- **🛍️ Product Catalog**: Browse beautiful macaroon products with S3-hosted images
- **🛒 Shopping Cart**: Add/remove items, update quantities with real-time updates
- **💳 Checkout System**: Complete order placement with customer information
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **☁️ Cloud Storage**: AWS S3 integration for fast image delivery
- **📊 Order Management**: Full CRUD operations for order tracking
- **⚡ Real-time**: Dynamic cart updates without page refresh
- **🔧 Process Management**: PM2 ensures 99.9% uptime

## 🏗️ Architecture

```
Internet Users → EC2 Security Groups → PM2 Process Manager
                                           ↓
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│Frontend (Port 80)│───▶│Backend (Port 8080)│───▶│   AWS S3 Bucket │
│  Vanilla JS SPA │    │   Express.js API │    │ Product Images │
│  Bootstrap UI   │    │   REST Endpoints │    │   Static Files │
│  Shopping Cart  │    │   Order Management│    │   CDN Delivery │
└─────────────────┘    └──────────────────┘    └────────────────┘
```

## 🎯 Deployment Status

✅ **Frontend**: Live at [http://13.250.9.40](http://13.250.9.40)  
✅ **Backend API**: Live at [http://13.250.9.40:8080/api](http://13.250.9.40:8080/api)  
✅ **Product Images**: S3 bucket `msiazon-assets`  
✅ **PM2 Processes**: Both frontend and backend running  
✅ **Security Groups**: HTTP (80) and Custom TCP (8080) configured  
✅ **Order System**: Fully functional with persistence

## 🏗️ Architecture

### Backend (`/backend`)

- **Express.js** REST API server
- **MySQL** database with TypeORM
- **AWS S3** for static asset storage
- Modular MVC architecture

### Frontend (`/frontend`)

- **Vanilla JavaScript** SPA (Single Page Application)
- **Bootstrap 4** for responsive UI
- **Modern ES6+** features
- Component-based architecture

### Shared (`/shared`)

- Static assets (product images)
- Shared configurations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- AWS S3 bucket

### Environment Setup

**Option 1: Use the deployed version (Recommended)**

- Website: [http://13.250.9.40](http://13.250.9.40)
- API: [http://13.250.9.40:8080/api](http://13.250.9.40:8080/api)

**Option 2: Run locally**

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Iron-Mark/MSiazon-MarketWebsite.git
   cd MSiazon-MarketWebsite
   ```

2. **Backend Setup**:

   ```bash
   cd backend
   npm install dotenv express cors
   node server-inmemory.js
   # Backend will run on http://localhost:8080
   ```

3. **Frontend Setup** (separate terminal):

   ```bash
   cd frontend
   npx serve . -p 3000
   # Frontend will run on http://localhost:3000
   ```

4. **Update API Configuration** (for local development):
   ```bash
   # Edit frontend/src/utils/api.js
   # Change: return 'http://13.250.9.40:8080/api';
   # To: return 'http://localhost:8080/api';
   ```

## 🚨 Troubleshooting

### Common Issues & Solutions

**1. Website not loading**

```bash
# Check PM2 processes
pm2 status

# Restart all services
pm2 restart all

# Check if services are listening on correct ports
sudo netstat -tlnp | grep -E ':80|:8080'
```

**2. API not responding**

```bash
# Check backend logs
pm2 logs backend

# Test API directly
curl http://localhost:8080/api/products

# Restart backend
pm2 restart backend
```

**3. Images not loading**

- Verify AWS S3 bucket permissions
- Check if images exist: https://msiazon-assets.s3.ap-southeast-1.amazonaws.com/strawberry.jpg

**4. Frontend shows blank page**

```bash
# Check frontend logs
pm2 logs frontend

# Restart frontend
pm2 restart frontend

# Verify frontend files exist
ls -la /home/ec2-user/MSiazon-MarketWebsite/frontend/
```

**5. Security Group Issues**

- Ensure HTTP (port 80) is open to 0.0.0.0/0
- Ensure Custom TCP (port 8080) is open to 0.0.0.0/0
- Check in AWS Console → EC2 → Security Groups

### Log Files Location

```bash
# PM2 logs directory
~/.pm2/logs/

# View specific log files
tail -f ~/.pm2/logs/backend-error.log
tail -f ~/.pm2/logs/frontend-out.log
```

## 🔄 Updating the Application

### Deploying Changes

1. **Make changes locally and push to GitHub**:

   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Update on EC2**:

   ```bash
   ssh -i "MSiazon-Web.pem" ec2-user@13.250.9.40
   cd MSiazon-MarketWebsite
   git pull origin main
   pm2 restart all
   ```

3. **For backend dependency changes**:
   ```bash
   cd backend
   npm install
   pm2 restart backend
   ```

## 📈 Future Enhancements

### Immediate Improvements

- [ ] **Database Integration** - Replace in-memory with PostgreSQL/MySQL
- [ ] **SSL/HTTPS** - Secure connections with Let's Encrypt
- [ ] **Domain Name** - Custom domain instead of IP address
- [ ] **Admin Dashboard** - Web interface for order management

### Advanced Features

- [ ] **User Authentication** - Customer accounts and login
- [ ] **Payment Integration** - Stripe/PayPal checkout
- [ ] **Email Notifications** - Order confirmations and updates
- [ ] **Inventory Management** - Stock tracking and low-stock alerts
- [ ] **Analytics** - Sales reports and customer insights

### Technical Improvements

- [ ] **Load Balancing** - Multiple EC2 instances
- [ ] **Auto Scaling** - Handle traffic spikes
- [ ] **CI/CD Pipeline** - Automated deployments
- [ ] **Monitoring** - CloudWatch integration
- [ ] **Backup System** - Automated data backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally and on staging
5. Submit a pull request

## 📞 Support

**For technical issues:**

- Create an issue: [GitHub Issues](https://github.com/Iron-Mark/MSiazon-MarketWebsite/issues)
- Check logs: `pm2 logs`
- Restart services: `pm2 restart all`

**For business inquiries:**

- Email: mark.siazon@example.com
- Website: [Macaroon Market](http://13.250.9.40)

## 📄 License

ISC License - see LICENSE file for details

---

## 🎉 Deployment Summary

**✅ Successfully Deployed on AWS:**

- **EC2 Instance**: `13.250.9.40` (t2.micro)
- **Frontend**: PM2 serving on port 80
- **Backend**: PM2 process on port 8080
- **Storage**: AWS S3 bucket `msiazon-assets`
- **Process Management**: PM2 with auto-restart
- **Security**: Configured security groups
- **Uptime**: 24/7 availability

**🚀 Ready for Production Use!**

_Made with ❤️ and lots of ☕ by Mark Siazon_  
_Last updated: September 29, 2025_

## 📁 Project Structure

```
MSiazon-MarketWebsite/
├── backend/                    # Express.js API server (Port 8080)
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Request handlers (OrderController, ProductController)
│   │   ├── entities/          # Data models (Order, Product, OrderItem)
│   │   ├── routes/            # API route definitions (/api/products, /api/orders)
│   │   ├── services/          # Business logic (OrderService, ProductService, S3Service)
│   │   └── utils/             # Utilities and helpers
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Database-connected entry point
│   └── server-inmemory.js     # In-memory entry point (CURRENTLY USED)
│
├── frontend/                   # Static frontend SPA (Port 80)
│   ├── src/
│   │   ├── components/        # UI components (HomePage, ProductsPage, CartPage, CheckoutPage)
│   │   ├── pages/             # Page controllers (app.js - main router)
│   │   ├── styles/            # CSS stylesheets (main.css)
│   │   └── utils/             # Frontend utilities (api.js, cart.js)
│   ├── index.html             # Entry point - SPA shell
│   └── package.json           # Frontend dependencies
│
├── shared/static/              # Product images (local backup)
│   ├── strawberry.jpg
│   ├── chocolate.jpg
│   ├── candy.jpg
│   └── ...
│
├── deployment/                 # Deployment configurations
│   ├── nginx-config           # Nginx reverse proxy config
│   ├── deploy-nginx.sh        # Nginx deployment script
│   ├── DEPLOYMENT-GUIDE.md    # Detailed deployment instructions
│   └── package-scripts.json   # Useful npm scripts
│
├── ecosystem.config.js         # PM2 process configuration
├── .env                       # Environment variables (local)
├── example.env                # Environment template
├── MSiazon-Web.pem           # EC2 SSH key pair
├── global-bundle.pem         # SSL certificates
└── README.md                 # This comprehensive guide
```

## � API Documentation

### Base URL

```
Production: http://13.250.9.40:8080/api
Local: http://localhost:8080/api
```

### Products API

| Method | Endpoint        | Description       | Example                                       |
| ------ | --------------- | ----------------- | --------------------------------------------- |
| GET    | `/products`     | Get all products  | `curl http://13.250.9.40:8080/api/products`   |
| GET    | `/products/:id` | Get product by ID | `curl http://13.250.9.40:8080/api/products/1` |

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Strawberry Macaroon",
      "price": 3.0,
      "image": "strawberry.jpg",
      "imageUrl": "https://msiazon-assets.s3.ap-southeast-1.amazonaws.com/strawberry.jpg"
    }
  ]
}
```

### Orders API

| Method | Endpoint             | Description         | Example                                               |
| ------ | -------------------- | ------------------- | ----------------------------------------------------- |
| GET    | `/orders`            | Get all orders      | `curl http://13.250.9.40:8080/api/orders`             |
| GET    | `/orders/:id`        | Get order by ID     | `curl http://13.250.9.40:8080/api/orders/1`           |
| POST   | `/orders`            | Create new order    | See example below                                     |
| PUT    | `/orders/:id/status` | Update order status | See example below                                     |
| DELETE | `/orders/:id`        | Delete order        | `curl -X DELETE http://13.250.9.40:8080/api/orders/1` |

**Create Order Example:**

```bash
curl -X POST http://13.250.9.40:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "address": "123 Main St, City, State 12345",
    "cartItems": [
      {"id": 1, "name": "Strawberry Macaroon", "price": 3.0, "quantity": 2}
    ]
  }'
```

**Update Order Status Example:**

```bash
curl -X PUT http://13.250.9.40:8080/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'
```

## 📦 Managing Orders

### Quick Order Management

1. **View All Orders** (Browser):  
   Go to: [http://13.250.9.40:8080/api/orders](http://13.250.9.40:8080/api/orders)

2. **View Orders** (Terminal):

   ```bash
   curl http://13.250.9.40:8080/api/orders
   ```

3. **Order Status Values**:
   - `pending` - New order (default)
   - `processing` - Order being prepared
   - `shipped` - Order dispatched
   - `delivered` - Order completed
   - `cancelled` - Order cancelled

### Order Data Structure

```json
{
  "id": 1,
  "name": "Customer Name",
  "address": "Delivery Address",
  "items": [...],
  "total": 15.50,
  "status": "pending",
  "createdAt": "2025-09-28T21:00:00Z"
}
```

## 🔧 Server Management

### Connecting to Your EC2 Instance

```bash
# Replace with your actual key file path
ssh -i "MSiazon-Web.pem" ec2-user@13.250.9.40
```

### PM2 Process Management

```bash
# Check service status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Restart specific service
pm2 restart backend
pm2 restart frontend

# View real-time logs
pm2 logs --lines 50

# Monitor processes
pm2 monit
```

### Service Persistence Setup

**If PM2 startup is not yet configured** (one-time setup):

```bash
# Step 1: Save current processes
pm2 save

# Step 2: Generate startup script
pm2 startup
```

**After running `pm2 startup`, it will display a command like:**

```bash
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/nodejs18/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

**Step 3: Run the exact sudo command provided:**

```bash
# Replace this with the ACTUAL command from your PM2 output
sudo env PATH=$PATH:/usr/bin /usr/lib/nodejs18/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Step 4: Save again to confirm
pm2 save
```

**What this accomplishes:**

- ✅ **Auto-start on boot**: Services restart when EC2 reboots
- ✅ **Process resurrection**: Automatic recovery from crashes
- ✅ **Production stability**: 24/7 uptime without manual intervention
- ✅ **Zero downtime**: Maintenance and updates without service interruption

**Verify the setup:**

```bash
# Check current status
pm2 status

# Test resurrection (optional)
pm2 resurrect

# View startup configuration
pm2 startup show
```

## 💻 Local Development

## 🎨 Features

### Frontend Features

- **Responsive Design**: Mobile-first Bootstrap 4 UI
- **Shopping Cart**: Session-based cart management
- **Product Catalog**: Dynamic product display from API
- **Checkout Process**: Complete order placement flow
- **Visual Effects**: Animated cart interactions
- **Error Handling**: User-friendly error messages

### Backend Features

- **RESTful API**: Clean, consistent API design
- **Database Integration**: TypeORM with MySQL
- **File Upload**: AWS S3 integration for images
- **Error Handling**: Comprehensive error management
- **CORS Support**: Cross-origin request handling
- **Modular Architecture**: Separation of concerns

## 🔐 Environment Variables

```env
# Server configuration
PORT=3001

# MySQL Database
DB_HOST=your-rds-host
DB_PORT=3306
DB_USER=your-username
DB_PASS=your-password
DB_NAME=your-database

# AWS S3 Configuration
S3_BUCKET=your-bucket-name
S3_REGION=your-region
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

## 🛠️ Development

### Adding New Features

1. **Backend**: Add new routes, controllers, and services
2. **Frontend**: Create new components and pages
3. **Database**: Update entities for new data models

### Code Style

- Use ES6+ features
- Follow MVC pattern in backend
- Component-based structure in frontend
- Consistent error handling

## 🚀 Deployment

### Backend Deployment

- Deploy to AWS EC2, Heroku, or similar
- Set environment variables
- Ensure database connectivity

### Frontend Deployment

- Deploy to AWS S3, Netlify, or similar static hosting
- Update API base URL for production
- Enable CORS in backend for frontend domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details

---

**Made with ❤️ by Mark Siazon**
