#!/bin/bash

# Fresh AWS EC2 Deployment Script with ZIP Upload Option
# For Ubuntu 24.04 LTS

set -e

echo "=== Student Management System - Fresh AWS Deployment ==="
echo "Choose deployment method:"
echo "1. Git Clone (from repository)"
echo "2. ZIP File Upload (local project)"
read -p "Enter choice (1 or 2): " DEPLOY_METHOD

# Update system
echo "[INFO] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies (no MySQL - using RDS)
echo "[INFO] Installing Python, Nginx, and dependencies..."
sudo apt install python3-pip python3-venv python3-dev nginx unzip -y

# Get project files based on method
if [ "$DEPLOY_METHOD" = "1" ]; then
    # Git Clone Method
    read -p "Enter your GitHub repository URL: " REPO_URL
    echo "[INFO] Cloning repository..."
    git clone "$REPO_URL" student-management-system
elif [ "$DEPLOY_METHOD" = "2" ]; then
    # ZIP Upload Method
    echo "[INFO] ZIP file should be uploaded to /home/ubuntu/"
    echo "Available ZIP files:"
    ls -la /home/ubuntu/*.zip 2>/dev/null || echo "No ZIP files found"
    read -p "Enter ZIP filename (e.g., project.zip): " ZIP_FILE
    
    if [ ! -f "/home/ubuntu/$ZIP_FILE" ]; then
        echo "[ERROR] ZIP file not found: $ZIP_FILE"
        echo "Please upload your ZIP file first using:"
        echo "scp -i your-key.pem project.zip ubuntu@$HOSTNAME:/home/ubuntu/"
        exit 1
    fi
    
    echo "[INFO] Extracting ZIP file..."
    unzip "$ZIP_FILE" -d student-management-system
    
    # Handle different ZIP structures
    if [ -d "student-management-system/student-management-system" ]; then
        mv student-management-system/student-management-system/* student-management-system/
        rmdir student-management-system/student-management-system
    fi
else
    echo "[ERROR] Invalid choice. Please run the script again."
    exit 1
fi

cd student-management-system

# Get RDS database details
echo "[INFO] Enter your RDS MySQL database details:"
read -p "RDS Endpoint (e.g., db.xyz.rds.amazonaws.com): " DB_HOST
read -p "Database name [studentdb]: " DB_NAME
DB_NAME=${DB_NAME:-studentdb}
read -p "Database username [admin]: " DB_USER
DB_USER=${DB_USER:-admin}
read -s -p "Database password: " DB_PASSWORD
echo

# Get domain/IP details
read -p "Enter your domain name (or press Enter for EC2 IP only): " DOMAIN_NAME
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
if [ -z "$DOMAIN_NAME" ]; then
    ALLOWED_HOSTS="$EC2_IP"
else
    ALLOWED_HOSTS="$DOMAIN_NAME,$EC2_IP"
fi

# Generate secret key
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')

# Create virtual environment and install dependencies
echo "[INFO] Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
echo "[INFO] Creating environment configuration..."
cat > .env << EOF
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=3306
SECRET_KEY=$SECRET_KEY
DEBUG=False
ALLOWED_HOSTS=$ALLOWED_HOSTS
EOF

# Load environment variables
export $(cat .env | xargs)

# Run Django setup
echo "[INFO] Running Django migrations..."
python manage.py migrate --settings=student_management.settings_production

echo "[INFO] Creating superuser..."
python manage.py createsuperuser --settings=student_management.settings_production

echo "[INFO] Collecting static files..."
python manage.py collectstatic --settings=student_management.settings_production --noinput

# Create demo data (optional)
read -p "Create demo data? (y/n): " CREATE_DEMO
if [ "$CREATE_DEMO" = "y" ]; then
    python manage.py shell --settings=student_management.settings_production < scripts/create_demo_data.py
fi

# Setup Gunicorn service
echo "[INFO] Setting up Gunicorn service..."
sudo tee /etc/systemd/system/gunicorn.service > /dev/null << EOF
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/student-management-system
EnvironmentFile=/home/ubuntu/student-management-system/.env
ExecStart=/home/ubuntu/student-management-system/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/home/ubuntu/student-management-system/student_management.sock student_management.wsgi:application --env DJANGO_SETTINGS_MODULE=student_management.settings_production

[Install]
WantedBy=multi-user.target
EOF

# Setup Nginx
echo "[INFO] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/student_management > /dev/null << EOF
server {
    listen 80;
    server_name $ALLOWED_HOSTS;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/ubuntu/student-management-system;
    }
    
    location /media/ {
        root /home/ubuntu/student-management-system;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/student-management-system/student_management.sock;
    }
}
EOF

# Enable site and start services
sudo ln -sf /etc/nginx/sites-available/student_management /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl restart nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

echo "=== DEPLOYMENT COMPLETE ==="
echo "Application URL: http://$EC2_IP"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "Domain URL: http://$DOMAIN_NAME"
fi
echo ""
echo "Default login credentials:"
echo "Admin: admin/admin123"
echo "Lecturer: lecturer/lecturer123"
echo "Student: student/student123"
echo ""
echo "Services status:"
sudo systemctl status gunicorn --no-pager -l
sudo systemctl status nginx --no-pager -l
EOF
