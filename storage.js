// Function to handle form submission (AddBook.html)
const bookForm = document.getElementById('add-book-form');

if (bookForm) {
    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newBook = {
            id: document.getElementById('book_id').value,
            name: document.getElementById('book_name').value,
            author: document.getElementById('author').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value
        };

        // Retrieve existing books or create empty array
        let books = JSON.parse(localStorage.getItem('archive_records')) || [];
        
        books.push(newBook);

        // Save back to local storage
        localStorage.setItem('archive_records', JSON.stringify(books));

        alert('Manuscript archived successfully!');
        window.location.href = 'AdminDashboard.html';
    });
}

// Function to display data in the table (AdminDashboard.html)
function displayBooks() {
    const tableBody = document.getElementById('books-body');
    const totalCount = document.getElementById('total-books');
    let books = JSON.parse(localStorage.getItem('archive_records')) || [];

    if (tableBody) {
        tableBody.innerHTML = ''; 
        
        books.forEach((book, index) => {
            const row = `
                <tr>
                    <td>#${book.id}</td>
                    <td><strong>${book.name}</strong></td>
                    <td>${book.author}</td>
                    <td><span style="color:#64748b">${book.category}</span></td>
                    <td>${book.description.substring(0, 40)}...</td>
                    <td>
                        <button class="delete-btn" onclick="deleteBook(${index})">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        if (totalCount) totalCount.innerText = books.length;
    }
}

// Function to remove a record
function deleteBook(index) {
    let books = JSON.parse(localStorage.getItem('archive_records')) || [];
    books.splice(index, 1);
    localStorage.setItem('archive_records', JSON.stringify(books));
    displayBooks();
}