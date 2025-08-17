from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Course
from django.core.validators import MinValueValidator, MaxValueValidator
import re

User = get_user_model()

class Feedback(models.Model):
    RATING_CHOICES = [
        (1, '1 Star - Poor'),
        (2, '2 Stars - Fair'),
        (3, '3 Stars - Good'),
        (4, '4 Stars - Very Good'),
        (5, '5 Stars - Excellent'),
    ]
    
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    lecturer = models.ForeignKey(User, on_delete=models.CASCADE, 
                               limit_choices_to={'role': 'lecturer'}, 
                               related_name='received_feedback')
    rating = models.IntegerField(choices=RATING_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, default='neutral')
    session = models.CharField(max_length=20)
    semester = models.CharField(max_length=1, choices=[('1', 'First'), ('2', 'Second')])
    is_anonymous = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'course', 'lecturer', 'session', 'semester']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback for {self.course.code} by {self.student.username if not self.is_anonymous else 'Anonymous'}"
    
    def save(self, *args, **kwargs):
        # Auto-analyze sentiment before saving
        self.sentiment = self.analyze_sentiment()
        super().save(*args, **kwargs)
    
    def analyze_sentiment(self):
        """Simple sentiment analysis based on keywords"""
        if not self.comment:
            return 'neutral'
        
        comment_lower = self.comment.lower()
        
        # Positive keywords
        positive_words = [
            'excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 
            'outstanding', 'brilliant', 'helpful', 'clear', 'engaging', 'interesting',
            'knowledgeable', 'patient', 'supportive', 'inspiring', 'effective',
            'well-organized', 'thorough', 'professional', 'dedicated', 'passionate'
        ]
        
        # Negative keywords
        negative_words = [
            'terrible', 'awful', 'bad', 'horrible', 'disappointing', 'confusing',
            'boring', 'unclear', 'unhelpful', 'disorganized', 'unprofessional',
            'difficult', 'hard', 'complicated', 'frustrating', 'poor', 'weak',
            'inadequate', 'insufficient', 'lacking', 'unsatisfactory'
        ]
        
        positive_count = sum(1 for word in positive_words if word in comment_lower)
        negative_count = sum(1 for word in negative_words if word in comment_lower)
        
        # Consider rating in sentiment analysis
        if self.rating >= 4:
            positive_count += 1
        elif self.rating <= 2:
            negative_count += 1
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'

class FeedbackSummary(models.Model):
    """Summary statistics for feedback"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    lecturer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'lecturer'})
    session = models.CharField(max_length=20)
    semester = models.CharField(max_length=1, choices=[('1', 'First'), ('2', 'Second')])
    
    total_feedback = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    positive_count = models.IntegerField(default=0)
    neutral_count = models.IntegerField(default=0)
    negative_count = models.IntegerField(default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['course', 'lecturer', 'session', 'semester']
        ordering = ['-session', '-semester']
    
    def __str__(self):
        return f"Summary for {self.course.code} - {self.lecturer.get_full_name()}"
    
    @classmethod
    def update_summary(cls, course, lecturer, session, semester):
        """Update feedback summary for a course-lecturer combination"""
        feedback_queryset = Feedback.objects.filter(
            course=course,
            lecturer=lecturer,
            session=session,
            semester=semester
        )
        
        if not feedback_queryset.exists():
            # Delete summary if no feedback exists
            cls.objects.filter(
                course=course,
                lecturer=lecturer,
                session=session,
                semester=semester
            ).delete()
            return None
        
        total_feedback = feedback_queryset.count()
        average_rating = feedback_queryset.aggregate(
            avg_rating=models.Avg('rating')
        )['avg_rating'] or 0.0
        
        positive_count = feedback_queryset.filter(sentiment='positive').count()
        neutral_count = feedback_queryset.filter(sentiment='neutral').count()
        negative_count = feedback_queryset.filter(sentiment='negative').count()
        
        summary, created = cls.objects.update_or_create(
            course=course,
            lecturer=lecturer,
            session=session,
            semester=semester,
            defaults={
                'total_feedback': total_feedback,
                'average_rating': round(average_rating, 2),
                'positive_count': positive_count,
                'neutral_count': neutral_count,
                'negative_count': negative_count,
            }
        )
        
        return summary
