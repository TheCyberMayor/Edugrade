# AWS Deployment Guide for Student Management System

## Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended for beginners)

1. **Install EB CLI**
   \`\`\`bash
   pip install awsebcli
   \`\`\`

2. **Initialize Elastic Beanstalk**
   \`\`\`bash
   eb init -p python-3.11 student-management-system
   \`\`\`

3. **Create environment**
   \`\`\`bash
   eb create production
   \`\`\`

4. **Deploy**
   \`\`\`bash
   eb deploy
   \`\`\`

### Option 2: AWS EC2 with Docker

1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 AMI
   - Instance type: t3.medium or larger
   - Configure security groups (ports 80, 443, 22)

2. **Install Docker**
   \`\`\`bash
   sudo yum update -y
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   \`\`\`

3. **Deploy with Docker Compose**
   \`\`\`bash
   git clone your-repo
   cd student-management-system
   docker-compose up -d
   \`\`\`

### Option 3: AWS ECS (Container Service)

1. **Build and push Docker image**
   \`\`\`bash
   docker build -t student-management .
   docker tag student-management:latest your-account.dkr.ecr.region.amazonaws.com/student-management:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/student-management:latest
   \`\`\`

2. **Create ECS cluster and service**
   - Use AWS Console or CLI to create ECS cluster
   - Create task definition with your Docker image
   - Create service with load balancer

## Required AWS Services

### 1. Database - Amazon RDS (PostgreSQL)
\`\`\`bash
# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier student-management-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password your-password \
    --allocated-storage 20
\`\`\`

### 2. Static Files - Amazon S3
\`\`\`bash
# Create S3 bucket
aws s3 mb s3://your-student-management-static
\`\`\`

### 3. Email Service - Amazon SES
\`\`\`bash
# Verify email address
aws ses verify-email-identity --email-address admin@yourdomain.com
\`\`\`

## Environment Variables

Set these environment variables in your AWS deployment:

\`\`\`bash
# Database
DB_NAME=student_management
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432

# AWS Services
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Django
DJANGO_SETTINGS_MODULE=student_management.settings_production
SECRET_KEY=your_very_secure_secret_key
DEBUG=False
\`\`\`

## Security Checklist

- [ ] Use HTTPS (SSL certificate via AWS Certificate Manager)
- [ ] Configure security groups properly
- [ ] Use IAM roles instead of access keys when possible
- [ ] Enable CloudWatch logging
- [ ] Set up backup strategy for RDS
- [ ] Configure auto-scaling if needed

## Monitoring and Maintenance

1. **CloudWatch Logs** - Monitor application logs
2. **RDS Monitoring** - Database performance
3. **S3 Access Logs** - Static file access
4. **Application Load Balancer** - Health checks

## Cost Optimization

- Use t3.micro instances for development
- Enable RDS automated backups
- Set up S3 lifecycle policies
- Use CloudFront CDN for static files
- Monitor costs with AWS Cost Explorer

## Troubleshooting

### Common Issues:
1. **Database connection errors** - Check security groups and RDS endpoint
2. **Static files not loading** - Verify S3 bucket permissions
3. **502 Bad Gateway** - Check Gunicorn process and logs
4. **SSL certificate issues** - Verify domain and certificate configuration

For detailed troubleshooting, check CloudWatch logs and application logs.
