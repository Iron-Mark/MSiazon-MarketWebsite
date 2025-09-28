#!/bin/bash

# Deploy Nginx configuration for Macaroon Market
echo "🚀 Setting up Nginx for Macaroon Market..."

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo yum update -y
    sudo yum install -y nginx
fi

# Copy nginx configuration
echo "⚙️ Configuring Nginx..."
sudo cp /home/ec2-user/MSiazon-MarketWebsite/deployment/nginx-config /etc/nginx/conf.d/macaroon-market.conf

# Update the configuration with current IP
sudo sed -i 's/YOUR_EC2_PUBLIC_IP/13.250.9.40/g' /etc/nginx/conf.d/macaroon-market.conf

# Test nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Enable and start nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    # Reload nginx with new configuration
    sudo systemctl reload nginx
    
    echo "🎉 Nginx setup complete!"
    echo "Your application should be available at: http://13.250.9.40"
else
    echo "❌ Nginx configuration has errors. Please check the configuration file."
fi