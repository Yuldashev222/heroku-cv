# Generated by Django 4.0.1 on 2022-04-01 09:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('career', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vacancy',
            name='active_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
