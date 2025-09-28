# 🚀 Mark Siazon's Macaroon Market - Complete EC2 Deployment Guide

**Version**: 1.0  
**Date**: September 29, 2025  
**Author**: GitHub Copilot Assistant  
**Repository**: https://github.com/Iron-Mark/MSiazon-MarketWebsite

---

## 📋 Prerequisites

- AWS EC2 instance (Amazon Linux 2 recommended)
- Security Group configured for HTTP/HTTPS traffic
- SSH key pair for EC2 access
- AWS S3 bucket for image storage
- Domain name (optional, for SSL)

---

## 🖥️ Phase 1: EC2 Initial Setup

### Connect to EC2 Instance

```bash
# Replace with your actual key and EC2 IP
ssh -i "your-key.pem" ec2-user@your-ec2-ip
```

### System Updates

```bash
# Update all system packages
sudo yum update -y
```

### Install Node.js 18.x

```bash
# Add Node.js 18.x repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### Install Global Dependencies

```bash
# Install PM2 process manager
sudo npm install -g pm2

# Install serve for frontend hosting
sudo npm install -g serve

# Install Git (if not already installed)
sudo yum install -y git
```

---

## 📁 Phase 2: Repository Setup

### Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone the project repository
git clone https://github.com/Iron-Mark/MSiazon-MarketWebsite.git

# Navigate to project directory
cd MSiazon-MarketWebsite

# Verify repository structure
ls -la
```

### Create Required Directories

```bash
# Create logs directory for PM2
mkdir -p logs

# Verify deployment folder
ls -la deployment/
```

---

## 🔧 Phase 3: Resolve Git Conflicts (If Any)

### Handle Existing Changes

```bash
# Check current git status
git status

# If there are local changes, stash them
git stash

# Pull latest changes from repository
git pull origin main

# Drop stashed changes (cleaned up files are no longer needed)
git stash drop

# Verify clean deployment structure
ls -la deployment/
# Should only show: .env.production and package-scripts.json
```

---

## 📦 Phase 4: Install Dependencies

### Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Verify backend package installation
ls -la node_modules/
```

### Frontend Dependencies

```bash
# Navigate to frontend directory
cd ../frontend

# Install frontend dependencies
npm install

# Verify frontend package installation
ls -la node_modules/

# Return to project root
cd ..
```

---

## ⚙️ Phase 5: Environment Configuration

### Setup Production Environment

```bash
# Copy production environment template
cp deployment/.env.production .env

# Edit environment file
nano .env
```

### Required Environment Variables

Update the following values in `.env`:

```bash
# Server Configuration
NODE_ENV=production
PORT=8080
FRONTEND_URL=http://YOUR-EC2-PUBLIC-IP

# Database Configuration
DB_TYPE=memory

# AWS S3 Configuration (REQUIRED)
S3_BUCKET=your-s3-bucket-name
S3_REGION=your-s3-region
S3_ACCESS_KEY=your-actual-access-key
S3_SECRET_KEY=your-actual-secret-key

# Session Configuration
SESSION_SECRET=your-secure-session-key

# Security Configuration
CORS_ORIGIN=http://YOUR-EC2-PUBLIC-IP,https://YOUR-EC2-PUBLIC-IP
```

### Get Your EC2 Public IP

```bash
# Get your EC2 public IP address
curl -s ifconfig.me
```

---

## 🔒 Phase 6: AWS Security Group Configuration

### Required Ports

Configure your EC2 Security Group to allow:

| Port | Protocol | Source    | Description      |
| ---- | -------- | --------- | ---------------- |
| 22   | TCP      | Your IP   | SSH Access       |
| 80   | TCP      | 0.0.0.0/0 | HTTP Frontend    |
| 8080 | TCP      | 0.0.0.0/0 | Backend API      |
| 443  | TCP      | 0.0.0.0/0 | HTTPS (optional) |

### AWS Console Steps

1. Go to **EC2 Dashboard** → **Security Groups**
2. Select your instance's security group
3. Click **Edit inbound rules**
4. Add the required ports above
5. Click **Save rules**

---

## 🧪 Phase 7: Test Backend Locally

### Verify Backend Functionality

```bash
# Navigate to backend directory
cd backend

# Start backend server for testing
node server-inmemory.js
```

### Test API Endpoints (New Terminal)

```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Test products endpoint
curl http://localhost:8080/api/products

# Expected health response:
# {"success":true,"message":"API is healthy","timestamp":"2025-09-29T..."}
```

### Stop Test Server

```bash
# Press Ctrl+C to stop the test server
# Return to project root
cd ..
```

---

## 🚀 Phase 8: Deploy with PM2

### Start Production Services

```bash
# Start both frontend and backend with PM2
pm2 start ecosystem.config.js --env production

# Check PM2 process status
pm2 status

# View real-time logs
pm2 logs

# Save PM2 configuration
pm2 save
```

### Expected PM2 Output

```bash
┌─────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ macaroon-backend│ default     │ 1.0.0   │ fork    │ 12345    │ 2m     │ 0    │ online    │ 0%       │ 45.2mb   │ ec2-user │ disabled │
│ 1   │ macaroon-frontend│ default    │ 1.0.0   │ fork    │ 12346    │ 2m     │ 0    │ online    │ 0%       │ 25.1mb   │ ec2-user │ disabled │
└─────┴─────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🔄 Phase 9: Setup PM2 Startup Persistence

### Generate Startup Script

```bash
# Generate PM2 startup script
pm2 startup

# This will output a command like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/nodejs18/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

### Execute Startup Command

```bash
# Copy and run the EXACT command from PM2 output
# Example (replace with your actual command):
sudo env PATH=$PATH:/usr/bin /usr/lib/nodejs18/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Save PM2 configuration again
pm2 save
```

### Verify Startup Configuration

```bash
# Check startup configuration
pm2 startup show

# Test process resurrection
pm2 kill
pm2 resurrect

# Verify processes are running again
pm2 status
```

---

## ✅ Phase 10: Final Testing & Verification

### Local Testing

```bash
# Test frontend locally
curl -I http://localhost:80

# Test backend API locally
curl http://localhost:8080/api/health
curl http://localhost:8080/api/products

# Check PM2 status
pm2 status

# View application logs
pm2 logs --lines 20
```

### External Testing

```bash
# Get your EC2 public IP
curl -s ifconfig.me

# Test from external (replace YOUR-EC2-IP)
curl http://YOUR-EC2-IP/
curl http://YOUR-EC2-IP:8080/api/health
```

### PM2 Management Commands

```bash
# Restart all processes
pm2 restart all

# Reload processes (zero downtime)
pm2 reload all

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Monitor processes
pm2 monit

# View logs
pm2 logs
pm2 logs macaroon-backend
pm2 logs macaroon-frontend
```

---

## 🌐 Phase 11: Access Your Application

### Live Application URLs

| Service          | URL                                    | Description          |
| ---------------- | -------------------------------------- | -------------------- |
| **Website**      | `http://YOUR-EC2-IP`                   | Main macaroon market |
| **API Health**   | `http://YOUR-EC2-IP:8080/api/health`   | API status check     |
| **Products API** | `http://YOUR-EC2-IP:8080/api/products` | Product listings     |
| **Orders API**   | `http://YOUR-EC2-IP:8080/api/orders`   | Order management     |

### Test Order Placement

1. Visit `http://YOUR-EC2-IP`
2. Add products to cart
3. Fill checkout form
4. Submit order
5. Check API: `http://YOUR-EC2-IP:8080/api/orders`

---

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### PM2 Processes Not Starting

```bash
# Check PM2 logs for errors
pm2 logs

# Restart individual processes
pm2 restart macaroon-backend
pm2 restart macaroon-frontend

# Reinstall dependencies if needed
cd backend && npm install
cd ../frontend && npm install
```

#### Port 80 Permission Issues

```bash
# If port 80 requires sudo
sudo pm2 start ecosystem.config.js --env production

# Alternative: Use different port
pm2 delete macaroon-frontend
pm2 serve frontend 3000 --name "macaroon-frontend"
```

#### Frontend Not Serving

```bash
# Delete and recreate frontend process
pm2 delete macaroon-frontend
pm2 serve frontend 80 --name "macaroon-frontend"
pm2 save
```

#### Backend API Errors

```bash
# Check backend logs
pm2 logs macaroon-backend

# Verify environment file
cat .env

# Restart backend
pm2 restart macaroon-backend
```

#### S3 Image Loading Issues

```bash
# Verify S3 credentials in .env
# Check S3 bucket permissions
# Ensure bucket is in correct region
```

#### Database Connection Issues

**Problem**: `connect ETIMEDOUT` errors when connecting to RDS MySQL

**Symptoms**:

```bash
❌ Database connection failed (attempt 1): connect ETIMEDOUT 172.31.48.67:3306
```

**Solutions**:

1. **Check RDS Security Group**:

   - Go to AWS RDS Console → Your RDS Instance → Security Groups
   - Ensure inbound rule allows MySQL (port 3306) from your EC2 security group
   - Add rule: `Type: MySQL, Port: 3306, Source: sg-yourec2securitygroup`

2. **Check RDS Instance Status**:

   - Go to AWS RDS Console → Instances
   - Ensure instance status is "Available"
   - Check if instance is in the same VPC as your EC2

3. **Verify Environment Variables**:

   ```bash
   # Check your .env file
   cat .env
   # Ensure DB_HOST, DB_USER, DB_PASS are correct
   ```

4. **Test Database Connection**:

   ```bash
   # Test from EC2 instance
   mysql -h your-rds-endpoint.amazonaws.com -P 3306 -u admin -p
   ```

5. **Graceful Fallback** (Current Implementation):
   - Backend automatically falls back to in-memory storage
   - Application continues working without database
   - Look for log message: `API is healthy (In-Memory Mode)`

**Working Configuration Example**:

```bash
# Backend working in In-Memory Mode with S3 images
curl http://localhost:8080/api/health
# Response: {"success":true,"message":"API is healthy (In-Memory Mode)"}

curl http://localhost:8080/api/products
# Response: Products with S3 image URLs included
```

### Log Locations

```bash
# PM2 logs directory
~/.pm2/logs/

# Application specific logs
tail -f ~/.pm2/logs/macaroon-backend-error.log
tail -f ~/.pm2/logs/macaroon-frontend-out.log
```

---

## 🔐 Security Best Practices

### Environment Security

- Never commit `.env` files to version control
- Use strong session secrets
- Regularly rotate AWS access keys
- Limit S3 bucket permissions

### EC2 Security

- Keep SSH key secure
- Limit SSH access to your IP only
- Regular security updates: `sudo yum update -y`
- Use HTTPS in production (SSL certificate)

### Application Security

- Validate all user inputs
- Implement rate limiting
- Use secure session configurations
- Regular dependency updates

---

## 🎯 Success Indicators

### ✅ Deployment Successful When

- [ ] PM2 shows both processes as "online"
- [ ] Frontend accessible at `http://YOUR-EC2-IP`
- [ ] API returns health check: `{"success":true,"message":"API is healthy"}`
- [ ] Products load from S3 images
- [ ] Orders can be placed successfully
- [ ] PM2 processes restart after reboot

### 📊 Expected Response Examples

**Health Check Response:**

```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2025-09-29T12:00:00.000Z"
}
```

**Products Response:**

```json
[
  {
    "id": 1,
    "name": "Strawberry Macaroon",
    "price": 3.0,
    "image": "https://msiazon-assets.s3.ap-southeast-1.amazonaws.com/strawberry.jpg"
  }
]
```

---

## 📞 Support & Maintenance

### Regular Maintenance Commands

```bash
# Weekly system updates
sudo yum update -y

# Check PM2 status
pm2 status

# View recent logs
pm2 logs --lines 50

# Restart services if needed
pm2 restart all
```

### Performance Monitoring

```bash
# Monitor system resources
top
htop

# Monitor PM2 processes
pm2 monit

# Check disk usage
df -h

# Check memory usage
free -m
```

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🆘 Emergency Procedures

### Complete Service Restart

```bash
pm2 kill
pm2 start ecosystem.config.js --env production
pm2 save
```

### Rollback to Previous Version

```bash
git log --oneline -5
git checkout <previous-commit-hash>
pm2 restart all
```

### Server Reboot Recovery

```bash
# After EC2 reboot, check services
pm2 status
pm2 resurrect

# If services don't start automatically
pm2 startup
# Run the sudo command provided
pm2 save
```

---

**🎉 Congratulations! Mark Siazon's Macaroon Market is now successfully deployed on AWS EC2!**

**Live Demo**: `http://YOUR-EC2-PUBLIC-IP`  
**API Endpoint**: `http://YOUR-EC2-PUBLIC-IP:8080/api`

---

_This guide was generated on September 29, 2025. For updates and issues, please refer to the GitHub repository._
