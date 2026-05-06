from django.urls import path
from . import views

urlpatterns = [
    # Pages
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
]