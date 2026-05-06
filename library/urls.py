from django.urls import path
from . import views

urlpatterns = [
    # Pages urls
    path('', views.index, name='index'),
    path('login/', views.login_page, name='login_page'),
    path('signup/', views.signup_page, name='signup_page'),
    path('User-Dashboard/', views.userdashboard_page, name='userdashboard_page'),
    path('Search-Books/', views.searchbooks_page, name='searchbooks_page'),
    path('BorrowedBooks/', views.borrowedbooks_page, name='borrowedbooks_page'),
    path('BookDetails/', views.bookdetails_page, name='bookdetails_page'),
    path('AdminDashboard/', views.admindashboard_page, name='admindashboard_page'),
    path('BookList/', views.booklist_page, name='booklist_page'),
    path('Books-Management/', views.booksmanagement_page, name='booksmanagement_page'),
    path('AddBook/', views.addbook_page, name='addbook_page'),
    path('Edit-Book/', views.editbook_page, name='editbook_page'),

    # Authentication urls
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/login/', views.login_view, name='login'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/auth/me/', views.me, name='me'),

    # Books urls
    path('api/books/', views.books_list, name='book_list'),
    path('api/books/<str:book_id>/', views.book_detail, name='book_detail'),
    path('api/books/add/', views.add_book, name='add_book'),
    path('api/books/add/<srt:book_id>/update/', views.update_book, name='update_book'),
    path('api/books/add/<str:book_id>/delete/', views.delete_book, name='delete_book'),
    path('api/books/search/', views.search_books, name='search_books'),
]