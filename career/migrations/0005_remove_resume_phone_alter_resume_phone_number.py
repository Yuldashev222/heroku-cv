# Generated by Django 4.0.1 on 2022-04-01 09:14

from django.db import migrations
import phonenumber_field.modelfields


class Migration(migrations.Migration):

    dependencies = [
        ('career', '0004_alter_resume_phone_alter_resume_phone_number'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='resume',
            name='phone',
        ),
        migrations.AlterField(
            model_name='resume',
            name='phone_number',
            field=phonenumber_field.modelfields.PhoneNumberField(blank=True, max_length=128, region=None),
        ),
    ]
