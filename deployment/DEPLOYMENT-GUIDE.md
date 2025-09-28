# 🚀 Complete AWS EC2 Deployment Guide

## 📋 Step-by-Step Instructions

### Phase 1: AWS Setup

#### 1.1 Create EC2 Instance

1. **Login to AWS Console** → EC2 Dashboard
2. **Launch Instance**:
   - **Name**: `macaroon-market-server`
   - **AMI**: Ubuntu Server 20.04 LTS (Free Tier)
   - **Instance Type**: `t3.medium` (recommended) or `t2.micro` (free tier)
   - **Key Pair**: Create new or use existing (.pem file)
   - **Storage**: 20 GB gp3 (minimum)

#### 1.2 Configure Security Group

1. **Create Security Group**: `macaroon-market-sg`
2. **Add Rules**:
   ```
   SSH (22)     - Your IP only
   HTTP (80)    - 0.0.0.0/0
   HTTPS (443)  - 0.0.0.0/0
   Custom (3000) - 0.0.0.0/0 (temporary)
   Custom (8080) - 0.0.0.0/0 (temporary)
   ```

#### 1.3 Elastic IP (Optional but Recommended)

1. **Allocate Elastic IP** in EC2 Console
2. **Associate** with your instance

---

### Phase 2: Server Setup

#### 2.1 Connect to EC2 Instance

```bash
# Windows (using Git Bash or WSL)
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# macOS/Linux
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

#### 2.2 Run Automated Deployment

```bash
# Download and run deployment script
curl -sSL https://raw.githubusercontent.com/Iron-Mark/MSiazon-MarketWebsite/main/deployment/deploy.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

#### 2.3 Manual Setup (Alternative)

If automated script fails, follow manual steps:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 and other tools
sudo npm install -g pm2 serve

# 4. Install Nginx
sudo apt install nginx git -y

# 5. Clone repository
git clone https://github.com/Iron-Mark/MSiazon-MarketWebsite.git
cd MSiazon-MarketWebsite

# 6. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 7. Create logs directory
mkdir -p logs
```

---

### Phase 3: Configuration

#### 3.1 Environment Variables

```bash
# Copy and edit environment file
cp deployment/.env.production .env
nano .env
```

**Update these values in .env**:

```env
# Replace with your domain or IP
FRONTEND_URL=http://your-ec2-public-ip

# Your S3 credentials
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Generate a secure session secret
SESSION_SECRET=your-very-secure-random-string
```

#### 3.2 Nginx Configuration

```bash
# Copy Nginx config
sudo cp deployment/nginx-config /etc/nginx/sites-available/macaroon-market

# Update domain in config (replace your-domain.com)
sudo nano /etc/nginx/sites-available/macaroon-market

# Enable site
sudo ln -sf /etc/nginx/sites-available/macaroon-market /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

---

### Phase 4: Deployment

#### 4.1 Start Services

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 config
pm2 save
pm2 startup

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 4.2 Verify Deployment

```bash
# Check PM2 status
pm2 status

# Test services
curl http://localhost:8080/api/health
curl http://localhost:3000

# Test external access
curl http://your-ec2-public-ip/api/health
```

---

### Phase 5: SSL Certificate (Production)

#### 5.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 5.2 Get SSL Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Phase 6: Monitoring & Management

#### 6.1 Useful Commands

```bash
# View application logs
pm2 logs

# Restart services
pm2 restart all

# Monitor processes
pm2 monit

# Check system resources
htop

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### 6.2 Update Application

```bash
cd /home/ubuntu/MSiazon-MarketWebsite

# Pull latest changes
git pull origin main

# Restart services
pm2 restart all
```

---

### 🎯 Post-Deployment Checklist

- [ ] EC2 instance running and accessible via SSH
- [ ] Security group configured with proper ports
- [ ] Environment variables configured (.env file)
- [ ] PM2 processes running (backend + frontend)
- [ ] Nginx proxy configured and running
- [ ] Application accessible via public IP
- [ ] API endpoints responding correctly
- [ ] S3 images loading properly
- [ ] SSL certificate installed (production only)

---

### 🚨 Troubleshooting

#### Common Issues

**1. Port 80 Permission Error**

```bash
sudo setcap 'cap_net_bind_service=+ep' $(which node)
```

**2. PM2 Processes Not Starting**

```bash
pm2 delete all
pm2 start ecosystem.config.js --env production
```

**3. Nginx 502 Bad Gateway**

```bash
# Check if backend is running
curl http://localhost:8080/api/health

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

**4. S3 Images Not Loading**

- Check S3 credentials in .env
- Verify S3 bucket permissions
- Check CORS settings on S3 bucket

---

### 📊 Success Indicators

✅ **Your deployment is successful when:**

1. PM2 shows both processes running
2. http://your-ip/api/health returns success
3. Frontend loads at http://your-ip
4. Products page shows images from S3
5. Shopping cart functionality works

**🎉 Congratulations! Your Mark Siazon's Macaroon Market is now live on AWS EC2!**
