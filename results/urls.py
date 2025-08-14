from django.urls import path
from . import views

urlpatterns = [
    path('', views.results_management, name='results_management'),
    path('upload/', views.upload_results, name='upload_results'),
    path('gpa/', views.gpa_calculator, name='gpa_calculator'),
    path('recalculate-gpa/', views.recalculate_gpa, name='recalculate_gpa'),
    path('delete/<int:result_id>/', views.delete_result, name='delete_result'),
]
