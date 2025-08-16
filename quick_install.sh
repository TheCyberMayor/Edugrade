#!/bin/bash

# Quick installation script - downloads and runs the main installer
echo "🚀 Django Student Management System - Quick Installer"
echo "This script will download and run the full installation script."
echo

# Download the main installation script
curl -o install_on_ec2.sh https://raw.githubusercontent.com/yourusername/student-management-system/master/install_on_ec2.sh

# Make it executable
chmod +x install_on_ec2.sh

# Run the installation
./install_on_ec2.sh
