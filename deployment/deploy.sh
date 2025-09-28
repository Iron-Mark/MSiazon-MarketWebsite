#!/bin/bash

# AWS EC2 Deployment Script for Mark Siazon's Macaroon Market
# Run this script on your EC2 instance

set -e  # Exit on any error

echo "🚀 Starting deployment of Mark Siazon's Macaroon Market..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/MSiazon-MarketWebsite"
APP_USER="ubuntu"
DOMAIN="your-domain.com"  # Change this to your domain

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Run as ubuntu user."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js installed: $node_version"
print_status "npm installed: $npm_version"

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2 serve

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install Git (if not already installed)
print_status "Installing Git..."
sudo apt install git -y

# Clone repository if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    print_status "Cloning repository..."
    cd /home/ubuntu
    git clone https://github.com/Iron-Mark/MSiazon-MarketWebsite.git
else
    print_status "Repository already exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
fi

cd $APP_DIR

# Create logs directory
mkdir -p logs

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install --production
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install --production
cd ..

# Copy production environment file
print_status "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp deployment/.env.production .env
    print_warning "Please edit .env file with your actual configuration values!"
    print_warning "nano .env"
else
    print_status "Environment file already exists"
fi

# Configure Nginx
print_status "Configuring Nginx..."
sudo cp deployment/nginx-config /etc/nginx/sites-available/macaroon-market

# Enable the site
sudo ln -sf /etc/nginx/sites-available/macaroon-market /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# Start services with PM2
print_status "Starting services with PM2..."
pm2 delete all 2>/dev/null || true  # Delete existing processes
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall (if ufw is available)
if command -v ufw > /dev/null; then
    print_status "Configuring firewall..."
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
fi

# Display status
print_status "Deployment completed! 🎉"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   Backend API: http://$(curl -s ifconfig.me)/api/health"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: pm2 logs"
echo "   Restart services: pm2 restart all"
echo "   Monitor: pm2 monit"
echo "   Nginx status: sudo systemctl status nginx"
echo ""
print_warning "Don't forget to:"
print_warning "1. Edit .env file with your actual configuration"
print_warning "2. Update domain name in Nginx config if needed"
print_warning "3. Set up SSL certificate with: sudo certbot --nginx -d $DOMAIN"
echo ""

print_status "🚀 Mark Siazon's Macaroon Market is now deployed!"