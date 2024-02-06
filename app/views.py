from django.shortcuts import render
from django.contrib import messages

def home(request):
    return render(request, 'app/index.html')