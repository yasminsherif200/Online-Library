from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Book, BorrowRecord
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json

# Create your views here.


# ------- Helper Decorators -------

# Called before admin-only pages 
def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login_page')
        if not request.user.is_staff:
            return redirect('login_page')
        return view_func(request, *args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper

# Called before user-only pages
def user_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login_page')
        if request.user.is_staff:
            return redirect('login_page')
        return view_func(request, *args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper


# ---------- Pages ----------

def index(request):
    return render(request, 'library/index.html')

def login_page(request):
    return render(request, 'library/login.html')

def signup_page(request):
    return render(request, 'library/signup.html')

# user-only pages

@user_required
def userdashboard_page(request):
    return render(request, 'library/User-Dashboard.html')

@user_required
def searchbooks_page(request):
    return render(request, 'library/Search-Books.html')

@user_required
def borrowedbooks_page(request):
    return render(request, 'library/BorrowedBooks.html')

@user_required
def bookdetails_page(request):
    return render(request, 'library/BookDetails.html')

# admin-only pages

@admin_required
def admindashboard_page(request):
    return render(request, 'library/AdminDashboard.html')

@admin_required
def booklist_page(request):
    return render(request, 'library/BookList.html')

@admin_required
def booksmanagement_page(request):
    return render(request, 'library/Books-Management.html')

@admin_required
def addbook_page(request):
    return render(request, 'library/AddBook.html')

@admin_required
def editbook_page(request):
    return render(request, 'library/Edit-Book.html')











