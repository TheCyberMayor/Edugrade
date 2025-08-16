"""
URL configuration for student_management project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('', include('accounts.urls')),
    path('results/', include('results.urls')),
    path('feedback/', include('feedback.urls')),
]
