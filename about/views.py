from django.shortcuts import render
from django.views.generic import TemplateView
# Create your views here.

class Home(TemplateView):
    template_name='index.html'
    
def about_us(request):
    return render(request, 'about-us.html')



