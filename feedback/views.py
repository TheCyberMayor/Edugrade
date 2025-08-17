from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.db.models import Q, Avg, Count
from django.http import JsonResponse
from accounts.models import Course
from results.models import Result
from .models import Feedback, FeedbackSummary

User = get_user_model()

@login_required
def feedback_submission(request):
    """Student feedback submission page"""
    if request.user.role != 'student':
        return redirect('dashboard')
    
    # Get courses the student has results for (can give feedback)
    student_courses = Course.objects.filter(
        result__student=request.user
    ).distinct()
    
    if request.method == 'POST':
        course_id = request.POST.get('course')
        lecturer_id = request.POST.get('lecturer')
        rating = int(request.POST.get('rating'))
        comment = request.POST.get('comment', '')
        session = request.POST.get('session')
        semester = request.POST.get('semester')
        
        try:
            course = get_object_or_404(Course, id=course_id)
            lecturer = get_object_or_404(User, id=lecturer_id, role='lecturer')
            
            # Check if student has results for this course
            if not Result.objects.filter(
                student=request.user,
                course=course,
                session=session,
                semester=semester
            ).exists():
                messages.error(request, 'You can only give feedback for courses you have taken.')
                return redirect('feedback_submission')
            
            # Create or update feedback
            feedback, created = Feedback.objects.update_or_create(
                student=request.user,
                course=course,
                lecturer=lecturer,
                session=session,
                semester=semester,
                defaults={
                    'rating': rating,
                    'comment': comment,
                }
            )
            
            # Update feedback summary
            FeedbackSummary.update_summary(course, lecturer, session, semester)
            
            action = 'submitted' if created else 'updated'
            messages.success(request, f'Feedback {action} successfully for {course.code}!')
            
        except Exception as e:
            messages.error(request, f'Error submitting feedback: {str(e)}')
    
    # Get available sessions and semesters from student's results
    student_results = Result.objects.filter(student=request.user)
    sessions = student_results.values_list('session', flat=True).distinct().order_by('-session')
    
    context = {
        'courses': student_courses,
        'sessions': sessions,
    }
    return render(request, 'feedback/feedback_submission.html', context)

@login_required
def get_course_lecturers(request):
    """AJAX endpoint to get lecturers for a course"""
    course_id = request.GET.get('course_id')
    if course_id:
        course = get_object_or_404(Course, id=course_id)
        lecturers = course.lecturers.all()
        data = [
            {
                'id': lecturer.id,
                'name': lecturer.get_full_name() or lecturer.username
            }
            for lecturer in lecturers
        ]
        return JsonResponse({'lecturers': data})
    return JsonResponse({'lecturers': []})

@login_required
def feedback_management(request):
    """Admin/Lecturer feedback management page"""
    if request.user.role not in ['admin', 'lecturer']:
        return redirect('dashboard')
    
    # Base queryset
    feedback_queryset = Feedback.objects.all()
    
    # If lecturer, only show their feedback
    if request.user.role == 'lecturer':
        feedback_queryset = feedback_queryset.filter(lecturer=request.user)
    
    # Apply filters
    course_id = request.GET.get('course')
    lecturer_id = request.GET.get('lecturer')
    session = request.GET.get('session')
    semester = request.GET.get('semester')
    sentiment = request.GET.get('sentiment')
    
    if course_id:
        feedback_queryset = feedback_queryset.filter(course_id=course_id)
    if lecturer_id and request.user.role == 'admin':
        feedback_queryset = feedback_queryset.filter(lecturer_id=lecturer_id)
    if session:
        feedback_queryset = feedback_queryset.filter(session=session)
    if semester:
        feedback_queryset = feedback_queryset.filter(semester=semester)
    if sentiment:
        feedback_queryset = feedback_queryset.filter(sentiment=sentiment)
    
    context = {
        'feedback_list': feedback_queryset.order_by('-created_at'),
        'courses': Course.objects.all() if request.user.role == 'admin' else Course.objects.filter(lecturers=request.user),
        'lecturers': User.objects.filter(role='lecturer') if request.user.role == 'admin' else None,
        'sessions': Feedback.objects.values_list('session', flat=True).distinct().order_by('-session'),
        'current_filters': {
            'course': course_id,
            'lecturer': lecturer_id,
            'session': session,
            'semester': semester,
            'sentiment': sentiment,
        }
    }
    return render(request, 'feedback/feedback_management.html', context)

@login_required
def feedback_analytics(request):
    """Feedback analytics dashboard"""
    if request.user.role not in ['admin', 'lecturer']:
        return redirect('dashboard')
    
    # Base queryset for summaries
    summaries = FeedbackSummary.objects.all()
    
    # If lecturer, only show their summaries
    if request.user.role == 'lecturer':
        summaries = summaries.filter(lecturer=request.user)
    
    # Apply filters
    course_id = request.GET.get('course')
    session = request.GET.get('session')
    semester = request.GET.get('semester')
    
    if course_id:
        summaries = summaries.filter(course_id=course_id)
    if session:
        summaries = summaries.filter(session=session)
    if semester:
        summaries = summaries.filter(semester=semester)
    
    # Calculate overall statistics
    total_feedback = summaries.aggregate(
        total=Count('id')
    )['total'] or 0
    
    average_rating = summaries.aggregate(
        avg=Avg('average_rating')
    )['avg'] or 0.0
    
    sentiment_totals = summaries.aggregate(
        positive=Count('id', filter=Q(sentiment='positive')),
        neutral=Count('id', filter=Q(sentiment='neutral')),
        negative=Count('id', filter=Q(sentiment='negative'))
    )
    
    context = {
        'summaries': summaries.order_by('-session', '-semester', 'course__code'),
        'courses': Course.objects.all() if request.user.role == 'admin' else Course.objects.filter(lecturers=request.user),
        'sessions': FeedbackSummary.objects.values_list('session', flat=True).distinct().order_by('-session'),
        'total_feedback': total_feedback,
        'average_rating': round(average_rating, 2),
        'sentiment_totals': sentiment_totals,
        'current_filters': {
            'course': course_id,
            'session': session,
            'semester': semester,
        }
    }
    return render(request, 'feedback/feedback_analytics.html', context)

@login_required
def delete_feedback(request, feedback_id):
    """Delete feedback (admin only)"""
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    if request.method == 'POST':
        feedback = get_object_or_404(Feedback, id=feedback_id)
        course = feedback.course
        lecturer = feedback.lecturer
        session = feedback.session
        semester = feedback.semester
        
        feedback.delete()
        
        # Update summary after deletion
        FeedbackSummary.update_summary(course, lecturer, session, semester)
        
        messages.success(request, 'Feedback deleted successfully.')
    
    return redirect('feedback_management')
