from django import forms
from .models import *

from phonenumber_field.formfields import PhoneNumberField
from phonenumber_field.widgets import PhoneNumberPrefixWidget


class CareerForm(forms.ModelForm):
    class Meta:
        model = Career
        fields = ['name', 'image', 'job_ads', 'tel']


class ResumeForm(forms.ModelForm):
    phone_number = PhoneNumberField(
        widget=PhoneNumberPrefixWidget(initial='UZ')
    )
    
    class Meta:
        model = Resume
        fields = ['name', 'email', 'phone_number', 'file']


class DutiesForm(forms.ModelForm):
    class Meta:
        model = Duties
        fields = ['text', ]


class SkillsForm(forms.ModelForm):
    class Meta:
        model = Skills
        fields = ['name', ]


class RequirementsForm(forms.ModelForm):
    class Meta:
        model = Requirements
        fields = ['text', ]


class ProsForm(forms.ModelForm):
    class Meta:
        model = Pros
        fields = ['text', ]


class VacancyForm(forms.ModelForm):
    class Meta:
        model = Vacancy
        fields = ['name', 'description', 'salary', 'job_type', 'graph', 'duties', 'requirements', 'skills', 'pros', 'active_date', 'active']