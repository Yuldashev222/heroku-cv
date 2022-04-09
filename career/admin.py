from django.contrib import admin
from .models import *


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'image', 'job_ads', 'tel']
    

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'salary', 'job_type', 'graph', 'active']
    
    # def clean(self, *args, **kwargs):
        
    #     print('clean ishladi /////////////////////////') 
    #     print(self)

    #     return self

@admin.register(Duties)
class DutiesAdmin(admin.ModelAdmin):
    display_fields = ['id', 'text']


@admin.register(Skills)
class SkillsAdmin(admin.ModelAdmin):
    display_fields = ['id', 'name']


@admin.register(Requirements)
class RequirementsAdmin(admin.ModelAdmin):
    display_fields = ['id', 'text']


@admin.register(Pros)
class ProsAdmin(admin.ModelAdmin):
    display_fields = ['id', 'text']


@admin.register(Resume)
class CvAdmin(admin.ModelAdmin):
    display_fields = ['id', 'name', 'email', 'phone_number', 'file', 'vacancy']
