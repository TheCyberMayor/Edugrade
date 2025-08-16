#!/bin/bash

# AWS EC2 Deployment Script
echo "Starting deployment to AWS EC2..."

# Update system packages
sudo yum update -y

# Install Python 3.11 and pip
sudo yum install -y python3.11 python3.11-pip

# Install PostgreSQL client
sudo yum install -y postgresql-devel

# Clone repository (replace with your repo URL)
git clone https://github.com/yourusername/student-management-system.git
cd student-management-system

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DJANGO_SETTINGS_MODULE=student_management.settings_production
export DEBUG=False

# Run migrations
python manage.py migrate --settings=student_management.settings_production

# Collect static files
python manage.py collectstatic --noinput --settings=student_management.settings_production

# Create superuser (optional)
echo "from accounts.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin123')" | python manage.py shell --settings=student_management.settings_production

# Start Gunicorn
gunicorn --bind 0.0.0.0:8000 --workers 3 student_management.wsgi:application

echo "Deployment completed!"
