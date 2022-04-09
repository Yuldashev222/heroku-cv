from django.shortcuts import render

from .models import *
from .forms import *


def career(request):
    vacancies = Vacancy.objects.filter(active=True)
    career = Career.objects.all().first()
    
    context = {
        'vacancies': vacancies,
        'career': career
    }
    return render(request, 'career.html', context)


def careerEdit(request):
    career = Career.objects.all().first()
    vacancies = Vacancy.objects.all()
    resumes = Resume.objects.all()
    
    
    careerForm = CareerForm(instance=career)
    resumeForm = ResumeForm()
    vacansyForm = VacancyForm()
    dutiesForm = DutiesForm()
    skillsForm = SkillsForm()
    requirementsForm = RequirementsForm()
    prosForm = ProsForm()
    
    context = {
        'resumeForm': resumeForm,
    }
    
    return render(request, 'header.html', context)