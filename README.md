# Student Management System

A comprehensive Django web application for managing student results, course feedback, and academic administration with role-based access control.

## 🚀 Technology Stack

### Backend
- **Django 4.2** - Python web framework
- **Python 3.8+** - Programming language
- **SQLite** - Database (development)
- **Django Admin** - Administrative interface

### Frontend
- **Django Templates** - Server-side templating
- **Bootstrap 5** - CSS framework for responsive design
- **JavaScript** - Client-side interactivity
- **Chart.js** - Data visualization

### Development Tools
- **Django Debug Toolbar** - Development debugging
- **Python Virtual Environment** - Dependency isolation

## 📁 Project Structure

\`\`\`
├── manage.py                     # Django management script
├── student_management/           # Main project directory
│   ├── __init__.py
│   ├── settings.py              # Django settings
│   ├── urls.py                  # Main URL configuration
│   └── wsgi.py                  # WSGI configuration
├── accounts/                     # User authentication app
│   ├── models.py                # User model extensions
│   ├── views.py                 # Authentication views
│   ├── urls.py                  # Authentication URLs
│   └── admin.py                 # Admin configuration
├── core/                        # Core application logic
│   ├── models.py                # Department and Course models
│   ├── views.py                 # Dashboard and management views
│   ├── urls.py                  # Core URLs
│   └── admin.py                 # Admin interface
├── results/                     # Results management app
│   ├── models.py                # Result models
│   ├── views.py                 # Results management views
│   ├── urls.py                  # Results URLs
│   └── admin.py                 # Results admin
├── feedback/                    # Feedback system app
│   ├── models.py                # Feedback models
│   ├── views.py                 # Feedback views
│   ├── urls.py                  # Feedback URLs
│   └── admin.py                 # Feedback admin
├── templates/                   # Django templates
│   ├── base.html                # Base template
│   ├── landing.html             # Landing page
│   ├── accounts/                # Authentication templates
│   │   ├── login.html           # Login page
│   │   └── dashboard.html       # Dashboard base
│   ├── core/                    # Core templates
│   │   ├── admin_dashboard.html # Admin dashboard
│   │   ├── lecturer_dashboard.html # Lecturer dashboard
│   │   └── student_dashboard.html # Student dashboard
│   ├── results/                 # Results templates
│   │   ├── results_management.html
│   │   ├── upload_results.html
│   │   └── gpa_calculator.html
│   └── feedback/                # Feedback templates
│       ├── feedback_submission.html
│       ├── feedback_management.html
│       └── feedback_analytics.html
├── static/                      # Static files
│   ├── css/                     # Custom CSS
│   ├── js/                      # JavaScript files
│   └── images/                  # Image assets
└── scripts/                     # Database scripts
    └── create_demo_data.py      # Demo data creation
\`\`\`



### User Model (Extended)
\`\`\`python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('lecturer', 'Lecturer'),
        ('student', 'Student'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    student_id = models.CharField(max_length=20, blank=True, null=True)
    department = models.ForeignKey('core.Department', on_delete=models.SET_NULL, null=True, blank=True)
