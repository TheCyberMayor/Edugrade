#!/usr/bin/env python
"""
Script to create demo data for the Student Management System
Run this after running migrations: python manage.py shell < scripts/create_demo_data.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Department, Course

User = get_user_model()

def create_demo_data():
    print("Creating demo data...")
    
    # Create demo users
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin123',
            role='admin',
            first_name='System',
            last_name='Administrator'
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        print("Created admin user")
    
    # Create departments
    cs_dept, created = Department.objects.get_or_create(
        code='CS',
        defaults={'name': 'Computer Science'}
    )
    if created:
        print("Created Computer Science department")
    
    math_dept, created = Department.objects.get_or_create(
        code='MATH',
        defaults={'name': 'Mathematics'}
    )
    if created:
        print("Created Mathematics department")
    
    # Create lecturer
    if not User.objects.filter(username='lecturer').exists():
        lecturer = User.objects.create_user(
            username='lecturer',
            email='lecturer@example.com',
            password='lecturer123',
            role='lecturer',
            first_name='John',
            last_name='Smith',
            department=cs_dept
        )
        print("Created lecturer user")
    else:
        lecturer = User.objects.get(username='lecturer')
    
    # Create student
    if not User.objects.filter(username='student').exists():
        student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='student123',
            role='student',
            first_name='Jane',
            last_name='Doe',
            student_id='STU001',
            department=cs_dept
        )
        print("Created student user")
    
    # Create courses
    course1, created = Course.objects.get_or_create(
        code='CS101',
        defaults={
            'title': 'Introduction to Programming',
            'unit': 3,
            'department': cs_dept
        }
    )
    if created:
        course1.lecturers.add(lecturer)
        print("Created CS101 course")
    
    course2, created = Course.objects.get_or_create(
        code='CS201',
        defaults={
            'title': 'Data Structures and Algorithms',
            'unit': 4,
            'department': cs_dept
        }
    )
    if created:
        course2.lecturers.add(lecturer)
        print("Created CS201 course")
    
    print("Demo data creation completed!")

if __name__ == '__main__':
    create_demo_data()
