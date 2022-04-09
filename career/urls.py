from django.urls import path
from .views import career, careerEdit

urlpatterns = [
    path('', career, name='career'),
    path('carAdmin/', careerEdit, name='career-edit'),
]

