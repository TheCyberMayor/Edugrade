# ZIP File Deployment Guide

## Method 1: Upload ZIP File to EC2

### Step 1: Prepare Your Project ZIP
\`\`\`bash
# On your local machine, create ZIP of your project
zip -r student-management-system.zip student-management-system/
# OR download ZIP from GitHub: Code → Download ZIP
\`\`\`

### Step 2: Upload ZIP to EC2
\`\`\`bash
# Upload ZIP file to EC2 instance
scp -i your-key.pem student-management-system.zip ubuntu@your-ec2-ip:/home/ubuntu/
\`\`\`

### Step 3: Run Deployment Script
\`\`\`bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Make script executable and run
chmod +x deploy_with_zip.sh
./deploy_with_zip.sh

# Choose option 2 (ZIP File Upload)
# Enter the ZIP filename when prompted
\`\`\`

## Method 2: Direct Upload via AWS Console

### Step 1: Use EC2 Instance Connect
1. AWS Console → EC2 → Select your instance
2. Click "Connect" → "EC2 Instance Connect"
3. Upload files through the browser interface

### Step 2: Extract and Deploy
\`\`\`bash
# In the EC2 Instance Connect terminal
unzip student-management-system.zip
cd student-management-system
chmod +x deploy_with_zip.sh
./deploy_with_zip.sh
\`\`\`

## Method 3: Using wget (if ZIP is hosted online)

\`\`\`bash
# If your ZIP is hosted somewhere (GitHub releases, etc.)
wget https://github.com/yourusername/repo/archive/main.zip
mv main.zip student-management-system.zip
./deploy_with_zip.sh
\`\`\`

## What You'll Need:
- RDS MySQL endpoint and credentials
- Your domain name (optional)
- ZIP file of your project

The script will automatically detect and handle different ZIP file structures.
