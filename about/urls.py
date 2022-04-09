from unicodedata import name
from django.urls import path
from .views import Home, about_us


urlpatterns=[
    path('',Home.as_view(), name='home'),
    path('about', about_us, name='about'),
]