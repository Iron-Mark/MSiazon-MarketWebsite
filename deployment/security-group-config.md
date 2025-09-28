# AWS EC2 Security Group Configuration

## Required Ports for Mark Siazon's Macaroon Market

### Inbound Rules

| Type       | Protocol | Port Range | Source            | Description                    |
| ---------- | -------- | ---------- | ----------------- | ------------------------------ |
| SSH        | TCP      | 22         | Your IP/0.0.0.0/0 | SSH access                     |
| HTTP       | TCP      | 80         | 0.0.0.0/0         | Web traffic                    |
| HTTPS      | TCP      | 443        | 0.0.0.0/0         | Secure web traffic             |
| Custom TCP | TCP      | 3000       | 0.0.0.0/0         | Frontend (development/testing) |
| Custom TCP | TCP      | 8080       | 0.0.0.0/0         | Backend API (development)      |

### Outbound Rules

| Type        | Protocol | Port Range | Destination | Description          |
| ----------- | -------- | ---------- | ----------- | -------------------- |
| All Traffic | All      | All        | 0.0.0.0/0   | All outbound traffic |

## Production Security Recommendations

### 1. Restrict SSH Access

```bash
# Only allow SSH from your IP address
Type: SSH, Protocol: TCP, Port: 22, Source: YOUR_IP/32
```

### 2. Use Application Load Balancer

```bash
# Route traffic through ALB instead of direct access
Type: HTTP, Protocol: TCP, Port: 80, Source: ALB_SECURITY_GROUP_ID
Type: HTTPS, Protocol: TCP, Port: 443, Source: ALB_SECURITY_GROUP_ID
```

### 3. Database Security (if using RDS)

```bash
# MySQL/PostgreSQL access only from application servers
Type: MySQL/Aurora, Protocol: TCP, Port: 3306, Source: APP_SECURITY_GROUP_ID
```

## AWS CLI Commands to Create Security Group

```bash
# Create security group
aws ec2 create-security-group \
    --group-name macaroon-market-sg \
    --description "Security group for Macaroon Market application"

# Add SSH rule
aws ec2 authorize-security-group-ingress \
    --group-name macaroon-market-sg \
    --protocol tcp \
    --port 22 \
    --cidr YOUR_IP/32

# Add HTTP rule
aws ec2 authorize-security-group-ingress \
    --group-name macaroon-market-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Add HTTPS rule
aws ec2 authorize-security-group-ingress \
    --group-name macaroon-market-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Add development ports (optional)
aws ec2 authorize-security-group-ingress \
    --group-name macaroon-market-sg \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name macaroon-market-sg \
    --protocol tcp \
    --port 8080 \
    --cidr 0.0.0.0/0
```
