window.onload = function() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    
    const idField = document.getElementById('bookID');
    if (bookId && idField) {
        idField.value = bookId;
    }
};


function deleteBook(button) {
    if (confirm("Are you sure you want to delete this book?")) {
        let row = button.closest('tr');
        row.remove();
        alert("Book removed successfully.");
    }
}


document.addEventListener('submit', function(e) {
    if (e.target.id === 'editBookForm') {
        let bName = document.getElementById('bookName').value.trim();
        let author = document.getElementById('author').value.trim();

        if (bName === "" || author === "") {
            alert("Please fill in all required fields!");
            e.preventDefault(); 
        } else {
            alert("Book details updated successfully for ID: " + document.getElementById('bookID').value);
        }
    }
});

function getBooks() {
  return JSON.parse(localStorage.getItem("books")) || [];
}

function saveBooks(books) {
  localStorage.setItem("books", JSON.stringify(books));
}

function addBook(title) {
  let books = getBooks();
  books.push({ id: Date.now(), title });
  saveBooks(books);
}

function addNewBook(e) {
  e.preventDefault();

  const title = document.getElementById("title").value;

  addBook(title);

  alert("Book added!");
}