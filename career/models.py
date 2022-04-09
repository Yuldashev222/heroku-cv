from django.db import models

from ckeditor.fields import RichTextField

from hitcount.models import HitCount
from hitcount.views import HitCountMixin

from phonenumber_field.modelfields import PhoneNumberField


class Career(models.Model):
    name = models.CharField(max_length=500)
    image = models.ImageField(upload_to='Career/images/')
    job_ads = models.TextField(verbose_name='Job advertisement title')
    tel = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name


class Vacancy(models.Model, HitCountMixin):
    JOB_CHOICES = [
        ('on', 'online'),
        ('off', 'offline')
    ]
    
    GRAPH = [
        ('full', 'full time'),
        ('part', 'part time')
    ]

    name = models.CharField(max_length=100)
    description = RichTextField(max_length=500, blank=True)
    salary = models.PositiveIntegerField(help_text='enter the currency in dollars', default=0)
    job_type = models.CharField(max_length=3, choices=JOB_CHOICES)
    graph = models.CharField(max_length=4, choices=GRAPH, default='full time')
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)
    active_date = models.DateField(blank=True, null=True)
    duties = models.ManyToManyField('Duties')
    requirements = models.ManyToManyField('Requirements')
    pros = models.ManyToManyField('Pros')
    skills = models.ManyToManyField('Skills')
    active = models.BooleanField()
    
    # hit_count_generic = GenericRelation(HitCount, object_id_field='object_pk', related_query_name='hit_count_generic_relation')


    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Vacancy'
        verbose_name_plural = 'Vacancies'


class Duties(models.Model):
    text = RichTextField()

    def __str__(self):
        return self.text

    class Meta:
        verbose_name = 'Duty'
        verbose_name_plural = 'Duties'


class Skills(models.Model):
    name = models.CharField(max_length=300)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'


class Requirements(models.Model):
    text = RichTextField()

    def __str__(self):
        return self.text

    class Meta:
        verbose_name = 'Requirement'
        verbose_name_plural = 'Requirements'


class Pros(models.Model):
    text = RichTextField()

    def __str__(self):
        return self.text


class Resume(models.Model):
    # statusResume = [
    #     ('')    
    # ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = PhoneNumberField(blank=True)
    file = models.FileField(help_text='Send your resume as a file')
    vacancy = models.ForeignKey(Vacancy, on_delete=models.SET_NULL, null=True)
    created_date = models.DateField(auto_now_add=True)
    # status = models.CharField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Resume'
        verbose_name_plural = 'Resumes'

