from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.feedback_submission, name='feedback_submission'),
    path('manage/', views.feedback_management, name='feedback_management'),
    path('analytics/', views.feedback_analytics, name='feedback_analytics'),
    path('get-lecturers/', views.get_course_lecturers, name='get_course_lecturers'),
    path('delete/<int:feedback_id>/', views.delete_feedback, name='delete_feedback'),
]
