from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Course(models.Model):
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)
    unit = models.IntegerField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    lecturers = models.ManyToManyField(User, limit_choices_to={'role': 'lecturer'}, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.code} - {self.title}"
