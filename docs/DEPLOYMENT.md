# 🚀 LannaFinChat Deployment Guide

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores
- **Network**: Stable internet connection

### Software Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## 🛠️ Installation Steps

### 1. Install Docker and Docker Compose

#### Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### CentOS/RHEL:
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone the Repository
```bash
git clone https://github.com/JeerasakAnanta/cs_project.git
cd cs_project
```

### 3. Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### Required Environment Variables:
```bash
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_HOST=localhost
DB_NAME=lannafinchat_db

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDINGS_MODEL=text-embedding-3-large

# Qdrant Vector Database
QDRANT_VECTERDB_HOST=http://localhost:6333
COLLECTION_NAME=lannafinchat_docs

# JWT Configuration
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend Environment Variables
VITE_BACKEND_CHATBOT_API=http://localhost:8003
VITE_BACKEND_DOCS_API=http://localhost:8004
VITE_BACKEND_DOCS_STATIC=http://localhost:8004
VITE_HOST=http://localhost:8004
VITE_WEB_GUI=http://localhost:8002

# Development Settings
DEBUG=false
ENVIRONMENT=production
```

### 4. Deploy the Application

#### Quick Deployment:
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh prod
```

#### Manual Deployment:
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 Access Points

After successful deployment, the application will be available at:

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip:8003
- **Qdrant Vector DB**: http://your-server-ip:6333
- **API Documentation**: http://your-server-ip:8003/docs

## 🔧 Management Commands

### View Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Application
```bash
# Pull latest code
git pull

# Redeploy
./deploy.sh prod
```

## 🔒 Security Considerations

### 1. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (if using SSL)
sudo ufw enable
```

### 2. SSL/TLS Configuration (Optional)
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Add your SSL certificates
cp your-cert.pem nginx/ssl/
cp your-key.pem nginx/ssl/

# Deploy with SSL
docker-compose -f docker-compose.prod.yml --profile ssl up -d
```

### 3. Database Security
- Use strong passwords
- Restrict database access to application only
- Regular backups

## 📊 Monitoring

### Health Checks
The application includes health checks for all services:
- PostgreSQL: Database connectivity
- Qdrant: Vector database health
- Backend: API endpoint availability
- Frontend: Web server health

### Log Monitoring
```bash
# Monitor application logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Monitor system resources
docker stats
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres lannafinchat_db > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres lannafinchat_db < backup.sql
```

### Volume Backup
```bash
# Backup all volumes
docker run --rm -v lannafinchat_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
docker run --rm -v lannafinchat_qdrant_data:/data -v $(pwd):/backup alpine tar czf /backup/qdrant_backup.tar.gz -C /data .
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80

# Kill the process or change port in docker-compose.prod.yml
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres
```

#### 3. Memory Issues
```bash
# Check memory usage
docker stats

# Increase swap space if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x deploy.sh
```

## 📞 Support

For issues and support:
- **Email**: jeerasakananta@gmail.com
- **GitHub**: https://github.com/JeerasakAnanta/cs_project/issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 