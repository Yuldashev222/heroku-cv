from distutils.command.upload import upload
from django.db import models


class Partner(models.Model):
    name = models.CharField(max_length=300)
    logo = models.ImageField(upload_to='Partner/logos/')
    link = models.URLField(blank=True)
    desc = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    tel = models.CharField(blank=True)
    