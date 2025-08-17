from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.contrib import messages
from django.db.models import Q
from accounts.models import Course, Department
from .models import Result, GPACalculation
import csv
from io import TextIOWrapper

User = get_user_model()

@login_required
def results_management(request):
    if request.user.role not in ['admin', 'lecturer']:
        return redirect('dashboard')
    
    # Get filter parameters
    session = request.GET.get('session', '')
    semester = request.GET.get('semester', '')
    course_id = request.GET.get('course', '')
    student_id = request.GET.get('student', '')
    
    # Base queryset
    results = Result.objects.all()
    
    # Apply filters
    if session:
        results = results.filter(session=session)
    if semester:
        results = results.filter(semester=semester)
    if course_id:
        results = results.filter(course_id=course_id)
    if student_id:
        results = results.filter(student_id=student_id)
    
    # If lecturer, only show their courses
    if request.user.role == 'lecturer':
        results = results.filter(course__lecturers=request.user)
    
    context = {
        'results': results.order_by('-session', '-semester', 'student__username'),
        'courses': Course.objects.all() if request.user.role == 'admin' else Course.objects.filter(lecturers=request.user),
        'students': User.objects.filter(role='student'),
        'sessions': Result.objects.values_list('session', flat=True).distinct().order_by('-session'),
        'current_session': session,
        'current_semester': semester,
        'current_course': course_id,
        'current_student': student_id,
    }
    return render(request, 'results/results_management.html', context)

@login_required
def upload_results(request):
    if request.user.role not in ['admin', 'lecturer']:
        return redirect('dashboard')
    
    if request.method == 'POST':
        upload_type = request.POST.get('upload_type')
        
        if upload_type == 'manual':
            return handle_manual_upload(request)
        elif upload_type == 'csv':
            return handle_csv_upload(request)
    
    courses = Course.objects.all() if request.user.role == 'admin' else Course.objects.filter(lecturers=request.user)
    students = User.objects.filter(role='student')
    
    context = {
        'courses': courses,
        'students': students,
    }
    return render(request, 'results/upload_results.html', context)

def handle_manual_upload(request):
    try:
        student_id = request.POST.get('student')
        course_id = request.POST.get('course')
        score = float(request.POST.get('score'))
        session = request.POST.get('session')
        semester = request.POST.get('semester')
        
        student = get_object_or_404(User, id=student_id, role='student')
        course = get_object_or_404(Course, id=course_id)
        
        # Check if lecturer has permission for this course
        if request.user.role == 'lecturer' and request.user not in course.lecturers.all():
            messages.error(request, 'You do not have permission to upload results for this course.')
            return redirect('upload_results')
        
        # Create or update result
        result, created = Result.objects.update_or_create(
            student=student,
            course=course,
            session=session,
            semester=semester,
            defaults={'score': score}
        )
        
        # Calculate GPA
        GPACalculation.calculate_gpa(student, session, semester)
        
        action = 'created' if created else 'updated'
        messages.success(request, f'Result {action} successfully for {student.get_full_name()} in {course.code}')
        
    except Exception as e:
        messages.error(request, f'Error uploading result: {str(e)}')
    
    return redirect('upload_results')

def handle_csv_upload(request):
    try:
        csv_file = request.FILES['csv_file']
        session = request.POST.get('csv_session')
        semester = request.POST.get('csv_semester')
        
        if not csv_file.name.endswith('.csv'):
            messages.error(request, 'Please upload a CSV file.')
            return redirect('upload_results')
        
        # Read CSV file
        file_data = csv_file.read().decode('utf-8')
        csv_data = csv.DictReader(file_data.splitlines())
        
        success_count = 0
        error_count = 0
        
        for row in csv_data:
            try:
                # Expected CSV columns: student_username, course_code, score
                student_username = row.get('student_username', '').strip()
                course_code = row.get('course_code', '').strip()
                score = float(row.get('score', 0))
                
                student = User.objects.get(username=student_username, role='student')
                course = Course.objects.get(code=course_code)
                
                # Check lecturer permission
                if request.user.role == 'lecturer' and request.user not in course.lecturers.all():
                    continue
                
                # Create or update result
                Result.objects.update_or_create(
                    student=student,
                    course=course,
                    session=session,
                    semester=semester,
                    defaults={'score': score}
                )
                
                # Calculate GPA
                GPACalculation.calculate_gpa(student, session, semester)
                success_count += 1
                
            except Exception as e:
                error_count += 1
                continue
        
        if success_count > 0:
            messages.success(request, f'Successfully uploaded {success_count} results.')
        if error_count > 0:
            messages.warning(request, f'{error_count} rows had errors and were skipped.')
            
    except Exception as e:
        messages.error(request, f'Error processing CSV file: {str(e)}')
    
    return redirect('upload_results')

@login_required
def gpa_calculator(request):
    if request.user.role not in ['admin', 'lecturer']:
        return redirect('dashboard')
    
    gpa_calculations = GPACalculation.objects.all().order_by('-session', '-semester', 'student__username')
    
    # Filter by student if provided
    student_id = request.GET.get('student')
    if student_id:
        gpa_calculations = gpa_calculations.filter(student_id=student_id)
    
    context = {
        'gpa_calculations': gpa_calculations,
        'students': User.objects.filter(role='student'),
        'current_student': student_id,
    }
    return render(request, 'results/gpa_calculator.html', context)

@login_required
def recalculate_gpa(request):
    if request.user.role not in ['admin', 'lecturer']:
        return redirect('dashboard')
    
    if request.method == 'POST':
        student_id = request.POST.get('student_id')
        session = request.POST.get('session')
        semester = request.POST.get('semester')
        
        try:
            student = get_object_or_404(User, id=student_id, role='student')
            gpa_calc = GPACalculation.calculate_gpa(student, session, semester)
            
            if gpa_calc:
                messages.success(request, f'GPA recalculated for {student.get_full_name()} - {session}/{semester}')
            else:
                messages.warning(request, f'No results found for {student.get_full_name()} in {session}/{semester}')
                
        except Exception as e:
            messages.error(request, f'Error recalculating GPA: {str(e)}')
    
    return redirect('gpa_calculator')

@login_required
def delete_result(request, result_id):
    if request.user.role not in ['admin', 'lecturer']:
        return redirect('dashboard')
    
    if request.method == 'POST':
        result = get_object_or_404(Result, id=result_id)
        
        # Check lecturer permission
        if request.user.role == 'lecturer' and request.user not in result.course.lecturers.all():
            messages.error(request, 'You do not have permission to delete this result.')
            return redirect('results_management')
        
        student = result.student
        session = result.session
        semester = result.semester
        
        result.delete()
        
        # Recalculate GPA after deletion
        GPACalculation.calculate_gpa(student, session, semester)
        
        messages.success(request, 'Result deleted successfully.')
    
    return redirect('results_management')
