from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Book(models.Model):
    GENRE_CHOICES = [
        # first value stored in DB, second value displayed in django admin and forms
        ('Historical Fiction', 'Historical Fiction'),
        ('Poetry', 'Poetry'),
        ('Adventure', 'Adventure'),
        ('Science', 'Science'),
        ('Non-Fiction', 'Non-Fiction'),
        ('Fiction', 'Fiction'),
        ('Mystery', 'Mystery'),
        ('Fantasy', 'Fantasy'),
    ]

    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=50, blank=True)
    genre = models.CharField(max_length=100, choices=GENRE_CHOICES)
    description = models.TextField(blank=True)
    cover = models.TextField(blank=True)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.title
    

class BorrowRecord(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    borrow_date = models.DateTimeField(auto_now_add=True)
    return_date = models.DateTimeField(null= True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.book.title}"
