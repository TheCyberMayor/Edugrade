from django.contrib import admin
from .models import Feedback, FeedbackSummary

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('course', 'lecturer', 'rating', 'sentiment', 'session', 'semester', 'created_at')
    list_filter = ('rating', 'sentiment', 'session', 'semester', 'course__department')
    search_fields = ('course__code', 'lecturer__username', 'comment')
    readonly_fields = ('sentiment', 'created_at')
    ordering = ['-created_at']

@admin.register(FeedbackSummary)
class FeedbackSummaryAdmin(admin.ModelAdmin):
    list_display = ('course', 'lecturer', 'session', 'semester', 'total_feedback', 'average_rating')
    list_filter = ('session', 'semester', 'course__department')
    search_fields = ('course__code', 'lecturer__username')
    readonly_fields = ('last_updated',)
    ordering = ['-session', '-semester']
