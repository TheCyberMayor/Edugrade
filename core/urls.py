from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('lecturer-dashboard/', views.lecturer_dashboard, name='lecturer_dashboard'),
    path('student-dashboard/', views.student_dashboard, name='student_dashboard'),
    
    path('admin/users/create/', views.admin_user_create, name='admin_user_create'),
    path('admin/users/<int:user_id>/', views.admin_user_detail, name='admin_user_detail'),
    path('admin/users/<int:user_id>/delete/', views.admin_user_delete, name='admin_user_delete'),
    
    path('admin/departments/create/', views.admin_department_create, name='admin_department_create'),
    path('admin/departments/<int:department_id>/', views.admin_department_detail, name='admin_department_detail'),
    path('admin/departments/<int:department_id>/delete/', views.admin_department_delete, name='admin_department_delete'),
    
    path('admin/courses/create/', views.admin_course_create, name='admin_course_create'),
    path('admin/courses/<int:course_id>/', views.admin_course_detail, name='admin_course_detail'),
    path('admin/courses/<int:course_id>/delete/', views.admin_course_delete, name='admin_course_delete'),
    
    path('get-course-students/', views.get_course_students, name='get_course_students'),
]
