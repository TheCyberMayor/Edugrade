#!/bin/bash

# Django Student Management System - EC2 Installation Script
# Run this script on a fresh Ubuntu 20.04 EC2 instance

set -e  # Exit on any error

echo "🚀 Starting Django Student Management System Installation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get user inputs
read -p "Enter your GitHub repository URL: " REPO_URL
read -p "Enter your domain name (or EC2 public IP): " DOMAIN_NAME
read -s -p "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
echo
read -s -p "Enter MySQL application password: " MYSQL_APP_PASSWORD
echo
read -p "Enter Django secret key (or press Enter to generate): " DJANGO_SECRET_KEY

# Generate secret key if not provided
if [ -z "$DJANGO_SECRET_KEY" ]; then
    DJANGO_SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
fi

print_status "Configuration received. Starting installation..."

# Step 1: Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    python3-pip \
    python3-venv \
    python3-dev \
    nginx \
    mysql-server \
    libmysqlclient-dev \
    pkg-config \
    git \
    ufw

# Step 3: Secure MySQL installation
print_status "Configuring MySQL..."

# First, try to connect without password (auth_socket) and set up authentication
print_status "Setting up MySQL authentication..."
sudo mysql << EOF
-- Set root password and switch to native password authentication
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';

-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove remote root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Remove test database
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- Reload privileges
FLUSH PRIVILEGES;
EOF

# Step 4: Create database and user
print_status "Creating database and user..."
mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
-- Create database
CREATE DATABASE IF NOT EXISTS studentdb;

-- Create user
CREATE USER IF NOT EXISTS 'studentuser'@'localhost' IDENTIFIED BY '$MYSQL_APP_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON studentdb.* TO 'studentuser'@'localhost';

-- Reload privileges
FLUSH PRIVILEGES;
EOF

# Step 5: Clone repository
print_status "Cloning repository..."
cd /home/ubuntu
if [ -d "student-management-system" ]; then
    rm -rf student-management-system
fi
git clone $REPO_URL student-management-system
cd student-management-system

# Step 6: Setup Python virtual environment
print_status "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Step 7: Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Step 8: Configure environment variables
print_status "Configuring environment variables..."
cat > .env << EOF
DB_NAME=studentdb
DB_USER=studentuser
DB_PASSWORD=$MYSQL_APP_PASSWORD
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=$DJANGO_SECRET_KEY
DEBUG=False
ALLOWED_HOSTS=$DOMAIN_NAME,localhost,127.0.0.1
EOF

# Step 9: Run Django setup
print_status "Running Django migrations..."
export $(cat .env | xargs)
python manage.py migrate --settings=student_management.settings_production

print_status "Collecting static files..."
python manage.py collectstatic --settings=student_management.settings_production --noinput

print_status "Creating superuser..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell --settings=student_management.settings_production

print_status "Creating demo data..."
if [ -f "scripts/create_demo_data.py" ]; then
    python manage.py shell --settings=student_management.settings_production < scripts/create_demo_data.py
fi

# Step 10: Create Gunicorn service
print_status "Setting up Gunicorn service..."
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
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Step 11: Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/student_management > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location = /favicon.ico { 
        access_log off; 
        log_not_found off; 
    }
    
    location /static/ {
        root /home/ubuntu/student-management-system;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location /media/ {
        root /home/ubuntu/student-management-system;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/student-management-system/student_management.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/student_management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Step 12: Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306  # MySQL port

# Step 13: Start services
print_status "Starting services..."
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl restart nginx
sudo systemctl enable nginx

# Step 14: Set proper permissions
print_status "Setting file permissions..."
sudo chown -R ubuntu:www-data /home/ubuntu/student-management-system
sudo chmod -R 755 /home/ubuntu/student-management-system

# Step 15: Final checks
print_status "Running final checks..."
sleep 5

# Check services status
if sudo systemctl is-active --quiet gunicorn; then
    print_status "✅ Gunicorn is running"
else
    print_error "❌ Gunicorn failed to start"
    sudo systemctl status gunicorn
fi

if sudo systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running"
else
    print_error "❌ Nginx failed to start"
    sudo systemctl status nginx
fi

if sudo systemctl is-active --quiet mysql; then
    print_status "✅ MySQL is running"
else
    print_error "❌ MySQL failed to start"
    sudo systemctl status mysql
fi

# Display completion message
echo
echo "🎉 Installation completed successfully!"
echo
echo "📋 Application Details:"
echo "   URL: http://$DOMAIN_NAME"
echo "   Admin Username: admin"
echo "   Admin Password: admin123"
echo
echo "📋 Demo Accounts:"
echo "   Lecturer - Username: lecturer, Password: lecturer123"
echo "   Student - Username: student, Password: student123"
echo
echo "🔧 Useful Commands:"
echo "   Check Gunicorn: sudo systemctl status gunicorn"
echo "   Check Nginx: sudo systemctl status nginx"
echo "   Check MySQL: sudo systemctl status mysql"
echo "   View logs: sudo journalctl -u gunicorn -f"
echo
echo "🔒 To enable SSL (recommended):"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN_NAME"
echo
print_warning "Remember to:"
print_warning "1. Change default passwords"
print_warning "2. Configure your domain's DNS to point to this server"
print_warning "3. Set up SSL certificate for production use"
print_warning "4. Configure regular database backups"
