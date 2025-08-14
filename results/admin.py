from django.contrib import admin
from .models import Result, GPACalculation

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'score', 'grade', 'session', 'semester')
    list_filter = ('session', 'semester', 'grade', 'course__department')
    search_fields = ('student__username', 'course__code', 'course__title')
    ordering = ['-session', '-semester', 'student__username']

@admin.register(GPACalculation)
class GPACalculationAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'semester', 'gpa', 'cgpa', 'total_units')
    list_filter = ('session', 'semester')
    search_fields = ('student__username',)
    ordering = ['-session', '-semester', 'student__username']
