# Mark Siazon's Macaroon Market

A modern, modular e-commerce application for selling delicious macaroons, built with a separated frontend and backend architecture.

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

1. **Backend Environment**:

   ```bash
   cd backend
   cp ../example.env .env
   # Edit .env with your database and AWS credentials
   ```

2. **Install Dependencies**:

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend** (Port 3001):

   ```bash
   cd backend
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

2. **Start Frontend** (Port 3000):

   ```bash
   cd frontend
   npm start
   # or for development:
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## 📁 Project Structure

```
MSiazon-MarketWebsite/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── entities/          # TypeORM entities
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utilities
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/                   # Static frontend SPA
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page controllers
│   │   ├── styles/            # CSS stylesheets
│   │   └── utils/             # Frontend utilities
│   ├── package.json
│   └── index.html             # Entry point
│
├── shared/                     # Shared resources
│   └── static/                # Product images
│
├── .env                       # Environment variables
├── .env.local.example         # Local development template
├── .env.production            # Production configuration
└── README.md                  # This file
```

## 🔧 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Health Check

- `GET /api/health` - API health status

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
