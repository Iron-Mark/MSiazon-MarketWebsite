# AWS EC2 Deployment Guide - Mark Siazon's Macaroon Market

## 🚀 Prerequisites

### 1. AWS Account Setup

- AWS Account with EC2 access
- Key Pair (.pem file) for SSH access
- Security Group configured for web traffic

### 2. Local Requirements

- AWS CLI installed and configured
- SSH client (PuTTY for Windows or native SSH)

## 📋 EC2 Instance Setup

### Step 1: Launch EC2 Instance

```bash
# Recommended Instance Type: t3.medium or t3.large
# Operating System: Ubuntu 20.04 LTS or Amazon Linux 2
# Storage: 20GB EBS volume
# Security Group: Allow ports 22, 80, 443, 3000, 8080
```

### Step 2: Connect to Instance

```bash
# Replace your-key.pem and your-ec2-ip
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install MySQL (if using MySQL instead of in-memory)
sudo apt install mysql-server -y
```

## 🔧 Application Deployment

### Step 1: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/Iron-Mark/MSiazon-MarketWebsite.git
cd MSiazon-MarketWebsite
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install global serve for frontend
sudo npm install -g serve
```

### Step 3: Configure Environment Variables

```bash
# Create production environment file
cp .env.example .env
nano .env
```

### Step 4: Start Services with PM2

```bash
# Start backend API
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
```

## 🌐 Nginx Configuration

### Step 1: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/macaroon-market
```

### Step 2: Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/macaroon-market /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 🔐 SSL Certificate (Optional but Recommended)

### Using Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Management

### Useful Commands

```bash
# View application logs
pm2 logs

# Restart services
pm2 restart all

# Monitor processes
pm2 monit

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8080 are not used by other services
2. **Permission issues**: Check file permissions and ownership
3. **Memory issues**: Monitor with `htop` and consider upgrading instance size
4. **S3 access**: Verify AWS credentials and S3 permissions

### Health Checks

```bash
# Test backend API
curl http://localhost:8080/api/health

# Test frontend
curl http://localhost:3000

# Test external access
curl http://your-ec2-public-ip/api/health
```

## 🚦 Production Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] S3 bucket accessible
- [ ] PM2 processes running
- [ ] Nginx proxy configured
- [ ] SSL certificate installed
- [ ] Security groups configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
