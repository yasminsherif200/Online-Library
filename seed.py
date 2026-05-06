import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'onlineLibrary.settings')
django.setup()

from library.models import Book

books = [
    {
        "title": "Echoes of Time",
        "author": "Evelyn St. Claire",
        "isbn": "978-0-001",
        "genre": "Historical Fiction",
        "description": "A journey through memory and forgotten civilisations across three centuries.",
        "cover": "imgs/book1.png",
        "available": True,
    },
    {
        "title": "The Silent Verse",
        "author": "Marcus Vane",
        "isbn": "978-0-002",
        "genre": "Poetry",
        "description": "A poetic exploration of silence, identity and the spaces between words.",
        "cover": "imgs/book2.png",
        "available": True,
    },
    {
        "title": "The Lost Meridian",
        "author": "Clara Osei",
        "isbn": "978-0-003",
        "genre": "Adventure",
        "description": "An adventure across uncharted lands in search of a forgotten empire.",
        "cover": "imgs/book3.png",
        "available": True,
    },
    {
        "title": "Oceans Within",
        "author": "Sarah Waters",
        "isbn": "978-0-004",
        "genre": "Science",
        "description": "A deep dive into marine biology and the mysteries of the deep sea.",
        "cover": "imgs/book4.png",
        "available": True,
    },
    {
        "title": "Peak Wisdom",
        "author": "Julian Frost",
        "isbn": "978-0-005",
        "genre": "Non-Fiction",
        "description": "Lessons from the world's highest mountains and the climbers who conquered them.",
        "cover": "imgs/book5.png",
        "available": True,
    },
]

for b in books:
    Book.objects.get_or_create(isbn=b["isbn"], defaults=b)
    print(f"Added: {b['title']}")

print("Seeding done!")