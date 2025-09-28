# 🚀 AWS EC2 Deployment - Quick Start

## One-Command Deployment

Copy and paste this command on your EC2 instance:

```bash
curl -sSL https://raw.githubusercontent.com/Iron-Mark/MSiazon-MarketWebsite/main/deployment/deploy.sh | bash
```

## Manual Steps Summary

### 1. **Create EC2 Instance**

- Ubuntu 20.04 LTS
- t3.medium (recommended)
- Security group: ports 22, 80, 443, 3000, 8080

### 2. **Connect to Server**

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

### 3. **Clone & Deploy**

```bash
git clone https://github.com/Iron-Mark/MSiazon-MarketWebsite.git
cd MSiazon-MarketWebsite
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

### 4. **Configure Environment**

```bash
nano .env
# Update your domain, S3 credentials, and session secret
```

### 5. **Update Nginx Domain**

```bash
sudo nano /etc/nginx/sites-available/macaroon-market
# Replace 'your-domain.com' with your actual domain/IP
sudo systemctl reload nginx
```

## 🎯 Quick Verification

After deployment, test these URLs:

- **Frontend**: http://your-ec2-ip
- **Backend API**: http://your-ec2-ip/api/health
- **Products**: http://your-ec2-ip/api/products

## 📊 Management Commands

```bash
pm2 status          # Check running processes
pm2 logs            # View application logs
pm2 restart all     # Restart services
pm2 monit           # Monitor resources
sudo systemctl reload nginx  # Reload Nginx
```

## 🔒 SSL Setup (Production)

```bash
sudo certbot --nginx -d your-domain.com
```

## 📁 Key Files Created

- `ecosystem.config.js` - PM2 configuration
- `deployment/.env.production` - Environment template
- `deployment/nginx-config` - Nginx proxy setup
- `deployment/deploy.sh` - Automated deployment script
- `deployment/DEPLOYMENT-GUIDE.md` - Complete guide

**🎉 Your Mark Siazon's Macaroon Market will be live at http://your-ec2-ip!**
