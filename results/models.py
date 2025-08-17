from django.db import models
from django.contrib.auth import get_user_model
from core.models import Course
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Result(models.Model):
    SEMESTER_CHOICES = [
        ('1', 'First Semester'),
        ('2', 'Second Semester'),
    ]
    
    GRADE_CHOICES = [
        ('A', 'A (70-100)'),
        ('B', 'B (60-69)'),
        ('C', 'C (50-59)'),
        ('D', 'D (45-49)'),
        ('F', 'F (0-44)'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    grade = models.CharField(max_length=1, choices=GRADE_CHOICES)
    session = models.CharField(max_length=20)  # e.g., "2023/2024"
    semester = models.CharField(max_length=1, choices=SEMESTER_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'course', 'session', 'semester']
        ordering = ['-session', '-semester', 'course__code']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.code} ({self.session}/{self.semester})"
    
    def save(self, *args, **kwargs):
        # Auto-calculate grade based on score
        if self.score >= 70:
            self.grade = 'A'
        elif self.score >= 60:
            self.grade = 'B'
        elif self.score >= 50:
            self.grade = 'C'
        elif self.score >= 45:
            self.grade = 'D'
        else:
            self.grade = 'F'
        super().save(*args, **kwargs)
    
    @property
    def grade_point(self):
        """Return grade point for GPA calculation"""
        grade_points = {'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0}
        return grade_points.get(self.grade, 0.0)

class GPACalculation(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    session = models.CharField(max_length=20)
    semester = models.CharField(max_length=1, choices=Result.SEMESTER_CHOICES)
    gpa = models.FloatField()
    cgpa = models.FloatField()
    total_units = models.IntegerField()
    total_points = models.FloatField()
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'session', 'semester']
        ordering = ['-session', '-semester']
    
    def __str__(self):
        return f"{self.student.username} - {self.session}/{self.semester} (GPA: {self.gpa})"

    @classmethod
    def calculate_gpa(cls, student, session, semester):
        """Calculate GPA for a specific semester"""
        results = Result.objects.filter(
            student=student,
            session=session,
            semester=semester
        )
        
        if not results.exists():
            return None
        
        total_points = 0
        total_units = 0
        
        for result in results:
            points = result.grade_point * result.course.unit
            total_points += points
            total_units += result.course.unit
        
        gpa = total_points / total_units if total_units > 0 else 0
        
        # Calculate CGPA (cumulative)
        all_results = Result.objects.filter(student=student)
        cumulative_points = 0
        cumulative_units = 0
        
        for result in all_results:
            points = result.grade_point * result.course.unit
            cumulative_points += points
            cumulative_units += result.course.unit
        
        cgpa = cumulative_points / cumulative_units if cumulative_units > 0 else 0
        
        # Save or update GPA calculation
        gpa_calc, created = cls.objects.update_or_create(
            student=student,
            session=session,
            semester=semester,
            defaults={
                'gpa': round(gpa, 2),
                'cgpa': round(cgpa, 2),
                'total_units': total_units,
                'total_points': total_points
            }
        )
        
        return gpa_calc
