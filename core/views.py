from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.contrib import messages
from django.db.models import Avg, Count
from .models import Department, Course
from results.models import Result, GPACalculation
from feedback.models import Feedback, FeedbackSummary
from collections import defaultdict
from django.utils import timezone

User = get_user_model()

def home(request):
    """Landing page"""
    return render(request, 'core/home.html')

@login_required
def admin_dashboard(request):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    context = {
        'total_users': User.objects.count(),
        'total_students': User.objects.filter(role='student').count(),
        'total_lecturers': User.objects.filter(role='lecturer').count(),
        'total_departments': Department.objects.count(),
        'total_courses': Course.objects.count(),
        'users': User.objects.all().order_by('-date_joined'),
        'departments': Department.objects.all().order_by('name'),
        'courses': Course.objects.all().order_by('code'),
        'lecturers': User.objects.filter(role='lecturer'),
    }
    return render(request, 'core/admin_dashboard.html', context)

@login_required
def lecturer_dashboard(request):
    if request.user.role != 'lecturer':
        return redirect('dashboard')
    
    # Get lecturer's courses
    user_courses = Course.objects.filter(lecturers=request.user)
    
    # Get students who have results in lecturer's courses
    students_with_results = User.objects.filter(
        role='student',
        result__course__in=user_courses
    ).distinct()
    
    # Get feedback for lecturer's courses
    lecturer_feedback = Feedback.objects.filter(lecturer=request.user)
    recent_feedback = lecturer_feedback.order_by('-created_at')[:5]
    
    # Calculate statistics
    total_courses = user_courses.count()
    total_students = students_with_results.count()
    total_feedback = lecturer_feedback.count()
    average_rating = lecturer_feedback.aggregate(avg=Avg('rating'))['avg'] or 0
    
    # Sentiment counts
    positive_feedback = lecturer_feedback.filter(sentiment='positive').count()
    neutral_feedback = lecturer_feedback.filter(sentiment='neutral').count()
    negative_feedback = lecturer_feedback.filter(sentiment='negative').count()
    
    # Add course statistics
    courses_with_stats = []
    for course in user_courses:
        course_students = User.objects.filter(
            role='student',
            result__course=course
        ).distinct().count()
        
        course_feedback = lecturer_feedback.filter(course=course)
        course_feedback_count = course_feedback.count()
        course_avg_rating = course_feedback.aggregate(avg=Avg('rating'))['avg'] or 0
        
        course.student_count = course_students
        course.feedback_count = course_feedback_count
        course.avg_rating = course_avg_rating
        courses_with_stats.append(course)
    
    # Get feedback summaries
    feedback_summaries = FeedbackSummary.objects.filter(
        lecturer=request.user
    ).order_by('-session', '-semester')[:6]
    
    context = {
        'courses': courses_with_stats,
        'students': students_with_results,
        'total_courses': total_courses,
        'total_students': total_students,
        'total_feedback': total_feedback,
        'average_rating': average_rating,
        'positive_feedback': positive_feedback,
        'neutral_feedback': neutral_feedback,
        'negative_feedback': negative_feedback,
        'recent_feedback': recent_feedback,
        'feedback_summaries': feedback_summaries,
    }
    return render(request, 'core/lecturer_dashboard.html', context)

@login_required
def student_dashboard(request):
    if request.user.role != 'student':
        return redirect('dashboard')
    
    # Get student's results
    student_results = Result.objects.filter(student=request.user).order_by('-session', '-semester', 'course__code')
    
    # Get GPA calculations
    gpa_calculations = GPACalculation.objects.filter(student=request.user).order_by('-session', '-semester')
    
    # Calculate statistics
    total_courses = student_results.values('course').distinct().count()
    total_units = sum(result.course.unit for result in student_results)
    
    # Get current CGPA (latest calculation)
    current_cgpa = 0
    if gpa_calculations.exists():
        current_cgpa = gpa_calculations.first().cgpa
    
    # Get feedback given by student
    feedback_given = Feedback.objects.filter(student=request.user).count()
    recent_feedback = Feedback.objects.filter(student=request.user).order_by('-created_at')[:4]
    
    # Organize results by session and semester
    results_by_session = defaultdict(lambda: defaultdict(dict))
    available_sessions = set()
    
    for result in student_results:
        session = result.session
        semester_display = result.get_semester_display()
        available_sessions.add(session)
        
        if semester_display not in results_by_session[session]:
            # Get GPA data for this session/semester
            gpa_data = gpa_calculations.filter(session=session, semester=result.semester).first()
            
            results_by_session[session][semester_display] = {
                'results': [],
                'gpa': gpa_data.gpa if gpa_data else 0,
                'cgpa': gpa_data.cgpa if gpa_data else 0,
                'total_units': 0,
                'total_points': 0
            }
        
        results_by_session[session][semester_display]['results'].append(result)
    
    # Calculate totals for each semester
    for session in results_by_session:
        for semester in results_by_session[session]:
            semester_data = results_by_session[session][semester]
            total_units = sum(r.course.unit for r in semester_data['results'])
            total_points = sum(r.grade_point * r.course.unit for r in semester_data['results'])
            
            semester_data['total_units'] = total_units
            semester_data['total_points'] = total_points
    
    context = {
        'student': request.user,
        'total_courses': total_courses,
        'current_cgpa': current_cgpa,
        'total_units': total_units,
        'feedback_given': feedback_given,
        'semester_gpas': gpa_calculations,
        'results_by_session': dict(results_by_session),
        'available_sessions': sorted(available_sessions, reverse=True),
        'recent_feedback': recent_feedback,
        'today': timezone.now().date(),
    }
    return render(request, 'core/student_dashboard.html', context)

@login_required
def admin_user_create(request):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        username = request.POST.get('username')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        role = request.POST.get('role')
        department_id = request.POST.get('department')
        password = request.POST.get('password')
        
        try:
            if user_id:  # Edit existing user
                user = get_object_or_404(User, id=user_id)
                user.username = username
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                user.role = role
                if department_id:
                    user.department = get_object_or_404(Department, id=department_id)
                if password:
                    user.set_password(password)
                user.save()
                messages.success(request, 'User updated successfully!')
            else:  # Create new user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role=role
                )
                if department_id:
                    user.department = get_object_or_404(Department, id=department_id)
                    user.save()
                messages.success(request, 'User created successfully!')
        except Exception as e:
            messages.error(request, f'Error: {str(e)}')
    
    return redirect('admin_dashboard')

@login_required
def admin_user_detail(request, user_id):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    user = get_object_or_404(User, id=user_id)
    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'department': user.department.id if user.department else None,
    }
    return JsonResponse(data)

@login_required
def admin_user_delete(request, user_id):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    if request.method == 'POST':
        user = get_object_or_404(User, id=user_id)
        if user != request.user:  # Don't allow self-deletion
            user.delete()
            messages.success(request, 'User deleted successfully!')
        else:
            messages.error(request, 'You cannot delete your own account!')
    
    return redirect('admin_dashboard')

@login_required
def admin_department_create(request):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    if request.method == 'POST':
        department_id = request.POST.get('department_id')
        name = request.POST.get('name')
        code = request.POST.get('code')
        
        try:
            if department_id:  # Edit existing department
                department = get_object_or_404(Department, id=department_id)
                department.name = name
                department.code = code
                department.save()
                messages.success(request, 'Department updated successfully!')
            else:  # Create new department
                Department.objects.create(name=name, code=code)
                messages.success(request, 'Department created successfully!')
        except Exception as e:
            messages.error(request, f'Error: {str(e)}')
    
    return redirect('admin_dashboard')

@login_required
def admin_department_detail(request, department_id):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    department = get_object_or_404(Department, id=department_id)
    data = {
        'id': department.id,
        'name': department.name,
        'code': department.code,
    }
    return JsonResponse(data)

@login_required
def admin_department_delete(request, department_id):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    if request.method == 'POST':
        department = get_object_or_404(Department, id=department_id)
        department.delete()
        messages.success(request, 'Department deleted successfully!')
    
    return redirect('admin_dashboard')

@login_required
def admin_course_create(request):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    if request.method == 'POST':
        course_id = request.POST.get('course_id')
        code = request.POST.get('code')
        title = request.POST.get('title')
        unit = request.POST.get('unit')
        department_id = request.POST.get('department')
        lecturer_ids = request.POST.getlist('lecturers')
        
        try:
            department = get_object_or_404(Department, id=department_id)
            
            if course_id:  # Edit existing course
                course = get_object_or_404(Course, id=course_id)
                course.code = code
                course.title = title
                course.unit = unit
                course.department = department
                course.save()
                course.lecturers.set(lecturer_ids)
                messages.success(request, 'Course updated successfully!')
            else:  # Create new course
                course = Course.objects.create(
                    code=code,
                    title=title,
                    unit=unit,
                    department=department
                )
                course.lecturers.set(lecturer_ids)
                messages.success(request, 'Course created successfully!')
        except Exception as e:
            messages.error(request, f'Error: {str(e)}')
    
    return redirect('admin_dashboard')

@login_required
def admin_course_detail(request, course_id):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    course = get_object_or_404(Course, id=course_id)
    data = {
        'id': course.id,
        'code': course.code,
        'title': course.title,
        'unit': course.unit,
        'department': course.department.id,
    }
    return JsonResponse(data)

@login_required
def admin_course_delete(request, course_id):
    if request.user.role != 'admin':
        return redirect('dashboard')
    
    if request.method == 'POST':
        course = get_object_or_404(Course, id=course_id)
        course.delete()
        messages.success(request, 'Course deleted successfully!')
    
    return redirect('admin_dashboard')

@login_required
def get_course_students(request):
    """AJAX endpoint to get students for a course"""
    if request.user.role != 'lecturer':
        return JsonResponse({'students': []})
    
    course_id = request.GET.get('course_id')
    if course_id:
        course = get_object_or_404(Course, id=course_id, lecturers=request.user)
        
        # Get students who have results in this course
        students = User.objects.filter(
            role='student',
            result__course=course
        ).distinct()
        
        students_data = []
        for student in students:
            result_count = Result.objects.filter(
                student=student,
                course=course
            ).count()
            
            students_data.append({
                'id': student.id,
                'name': student.get_full_name() or student.username,
                'username': student.username,
                'student_id': student.student_id or '',
                'result_count': result_count
            })
        
        return JsonResponse({'students': students_data})
    
    return JsonResponse({'students': []})
