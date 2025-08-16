from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.db.models import Avg, Count
from .models import Department, Course
from results.models import Result, GPACalculation
from feedback.models import Feedback, FeedbackSummary
from collections import defaultdict
from django.utils import timezone

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io

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
def generate_transcript_pdf(request):
    """Generate and download PDF transcript for student"""
    if request.user.role != 'student':
        return redirect('dashboard')
    
    # Create the HttpResponse object with PDF headers
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="transcript_{request.user.username}.pdf"'
    
    # Create the PDF object
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        textColor=colors.darkblue
    )
    
    # Get student data
    student = request.user
    student_results = Result.objects.filter(student=student).order_by('-session', '-semester', 'course__code')
    gpa_calculations = GPACalculation.objects.filter(student=student).order_by('-session', '-semester')
    
    # Calculate statistics
    total_units = sum(result.course.unit for result in student_results)
    current_cgpa = gpa_calculations.first().cgpa if gpa_calculations.exists() else 0
    
    # Get classification
    if current_cgpa >= 3.5:
        classification = "First Class"
    elif current_cgpa >= 2.5:
        classification = "Second Class Upper"
    elif current_cgpa >= 1.5:
        classification = "Second Class Lower"
    elif current_cgpa >= 1.0:
        classification = "Third Class"
    else:
        classification = "Pass"
    
    # Title
    elements.append(Paragraph("STUDENT MANAGEMENT SYSTEM", title_style))
    elements.append(Paragraph("OFFICIAL ACADEMIC TRANSCRIPT", title_style))
    elements.append(Spacer(1, 20))
    
    # Student Information Table
    student_info_data = [
        ['Student Name:', student.get_full_name() or student.username, 'Student ID:', student.username],
        ['Department:', student.department.name if student.department else 'Not Assigned', 'Current CGPA:', f"{current_cgpa:.2f}"],
        ['Total Units:', str(total_units), 'Classification:', classification],
    ]
    
    student_info_table = Table(student_info_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
    student_info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    elements.append(student_info_table)
    elements.append(Spacer(1, 20))
    
    # Academic Record
    elements.append(Paragraph("ACADEMIC RECORD", heading_style))
    
    # Organize results by session and semester
    results_by_session = defaultdict(lambda: defaultdict(list))
    for result in student_results:
        results_by_session[result.session][result.get_semester_display()].append(result)
    
    for session in sorted(results_by_session.keys(), reverse=True):
        elements.append(Paragraph(f"{session} Academic Session", heading_style))
        
        for semester in results_by_session[session]:
            semester_results = results_by_session[session][semester]
            
            # Get GPA data for this semester
            gpa_data = gpa_calculations.filter(
                session=session, 
                semester=semester_results[0].semester
            ).first()
            
            semester_gpa = gpa_data.gpa if gpa_data else 0
            semester_cgpa = gpa_data.cgpa if gpa_data else 0
            
            elements.append(Paragraph(f"{semester} Semester", styles['Heading3']))
            
            # Create results table
            table_data = [['Course Code', 'Course Title', 'Units', 'Grade', 'Points']]
            
            total_semester_units = 0
            total_semester_points = 0
            
            for result in semester_results:
                table_data.append([
                    result.course.code,
                    result.course.title,
                    str(result.course.unit),
                    result.grade,
                    f"{result.grade_point:.1f}"
                ])
                total_semester_units += result.course.unit
                total_semester_points += result.grade_point * result.course.unit
            
            # Add semester summary
            table_data.append([
                'Semester Summary',
                f'Units: {total_semester_units}',
                f'GPA: {semester_gpa:.2f}',
                f'CGPA: {semester_cgpa:.2f}',
                f'Points: {total_semester_points:.1f}'
            ])
            
            results_table = Table(table_data, colWidths=[1.2*inch, 2.5*inch, 0.8*inch, 0.8*inch, 0.8*inch])
            results_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            elements.append(results_table)
            elements.append(Spacer(1, 15))
    
    # Grade Scale
    elements.append(Paragraph("GRADE SCALE", heading_style))
    grade_scale_data = [
        ['Grade', 'Score Range', 'Points'],
        ['A', '70-100', '4.0'],
        ['B', '60-69', '3.0'],
        ['C', '50-59', '2.0'],
        ['D', '45-49', '1.0'],
        ['F', '0-44', '0.0']
    ]
    
    grade_scale_table = Table(grade_scale_data, colWidths=[1*inch, 1.5*inch, 1*inch])
    grade_scale_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(grade_scale_table)
    elements.append(Spacer(1, 20))
    
    # Footer
    elements.append(Paragraph(f"Generated on {timezone.now().strftime('%B %d, %Y')}", styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer and write it to the response
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    
    return response

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
