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

# ------------------------------------

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

# -----------------------------------------

# ---------- Authentication APIs ----------

@csrf_exempt
def register(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = json.loads(request.body)
    username  = data.get('username')
    email     = data.get('email')
    password  = data.get('password')
    is_admin  = data.get('is_admin', False)

    if User.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'message': 'Email already registered.'})

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=is_admin
    )

    login(request, user)

    return JsonResponse({
        'success': True,
        'username': user.username,
        'email': user.email,
        'role': 'admin' if user.is_staff else 'user'
    })

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data     = json.loads(request.body)
    email    = data.get('email')
    password = data.get('password')
    role     = data.get('role')

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'No account found with this email.'})

    user = authenticate(request, username=user_obj.username, password=password)

    if user is None:
        return JsonResponse({'success': False, 'message': 'Invalid password.'})

    if role == 'admin' and not user.is_staff:
        return JsonResponse({'success': False, 'message': 'No admin account found with these credentials.'})

    if role == 'user' and user.is_staff:
        return JsonResponse({'success': False, 'message': 'Invalid email or password.'})

    login(request, user)

    return JsonResponse({
        'success': True,
        'username': user.username,
        'email': user.email,
        'role': 'admin' if user.is_staff else 'user'
    })

@csrf_exempt
def logout_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    logout(request)
    return JsonResponse({'success': True})

def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Not logged in.'}, status=401)
    return JsonResponse({
        'success': True,
        'username': request.user.username,
        'email': request.user.email,
        'role': 'admin' if request.user.is_staff else 'user'
    })

# --------------------------------

# ---------- Books APIs ----------

def books_list(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    books = Book.objects.all()
    data = [
        {
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'isbn': book.isbn,
            'genre': book.genre,
            'description': book.description,
            'cover': book.cover,
            'available': book.available,
        }
        for book in books
    ]
    return JsonResponse(data, safe=False)

def book_detail(request, book_id):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found.'}, status=404)
    
    return JsonResponse({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'isbn': book.isbn,
        'genre': book.genre,
        'description': book.description,
        'cover': book.cover,
        'available': book.available,
    })

@csrf_exempt
def add_book(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'success': False, 'message': 'Unauthorized.'}, status=401)

    data        = json.loads(request.body)
    title       = data.get('title')
    author      = data.get('author')
    isbn        = data.get('isbn', '')
    genre       = data.get('genre')
    description = data.get('description', '')
    cover       = data.get('cover', '')

    if not title or not author or not genre:
        return JsonResponse({'success': False, 'message': 'Title, author and genre are required.'})

    book = Book.objects.create(
        title=title,
        author=author,
        isbn=isbn,
        genre=genre,
        description=description,
        cover=cover,
        available=True
    )

    return JsonResponse({'success': True, 'id': book.id})

@csrf_exempt
def update_book(request, book_id):
    if request.method != 'PUT':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'success': False, 'message': 'Unauthorized.'}, status=401)

    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found.'}, status=404)

    data = json.loads(request.body)

    book.title       = data.get('title', book.title)
    book.author      = data.get('author', book.author)
    book.isbn        = data.get('isbn', book.isbn)
    book.genre       = data.get('genre', book.genre)
    book.description = data.get('description', book.description)
    book.cover       = data.get('cover', book.cover)
    book.save()

    return JsonResponse({'success': True})

@csrf_exempt
def delete_book(request, book_id):
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'success': False, 'message': 'Unauthorized.'}, status=401)

    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found.'}, status=404)

    if not book.available:
        return JsonResponse({'success': False, 'message': 'Cannot delete a book that is currently borrowed.'})

    book.delete()
    return JsonResponse({'success': True})

def search_books(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    title  = request.GET.get('title', '').strip()
    author = request.GET.get('author', '').strip()
    genre  = request.GET.get('genre', '').strip()

    books = Book.objects.all()

    if title:
        books = books.filter(title__icontains=title)
    if author:
        books = books.filter(author__icontains=author)
    if genre:
        books = books.filter(genre__iexact=genre)

    data = [
        {
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'isbn': book.isbn,
            'genre': book.genre,
            'description': book.description,
            'cover': book.cover,
            'available': book.available,
        }
        for book in books
    ]
    return JsonResponse(data, safe=False)

# ------------------------------------










