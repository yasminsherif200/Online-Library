function initializeDatabase() {
    if (!localStorage.getItem('booksDB')) {
        const books = [
            { id: 101, name: "Clean Code", author: "Robert Martin", status: "Available", category: "Programming" },
            { id: 102, name: "Java Basics", author: "John Smith", status: "Available", category: "Programming" },
            { id: 103, name: "Database Systems", author: "Elmasri", status: "Reserved", category: "Database" },
            { id: 104, name: "Physics 101", author: "Newton", status: "Available", category: "Science" }
        ];
        localStorage.setItem('booksDB', JSON.stringify(books));
    }

    if (!sessionStorage.getItem('currentUser')) {
        const testUser = { username: "Abdullah_User", email: "user@example.com", role: "Normal user" };
        sessionStorage.setItem('currentUser', JSON.stringify(testUser));
    }
}

function renderNavbar() {
    const navbar = document.getElementById('dynamicNavbar');
    if (!navbar) return;

    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    let links = `<li><a href="index.html">Home</a></li>
                 <li><a href="Search-Books.html">Search Books</a></li>`;

    if (user) {
        if (user.role === "Normal user") {
            links += `<li><a href="User-Dashboard.html">User Dashboard</a></li>`;
        } else if (user.role === "Admin") {
            links += `<li><a href="Admin-Dashboard.html">Admin Dashboard</a></li>`;
        }
        links += `<li><a href="#" onclick="logout()">Logout (${user.username})</a></li>`;
    } else {
        links += `<li><a href="login.html">Login</a></li>`;
    }

    navbar.innerHTML = links;
}

function loadSearchTable(filterText = "", filterCategory = "All") {
    const tableBody = document.getElementById('searchTableBody');
    if (!tableBody) return; 

    const books = JSON.parse(localStorage.getItem('booksDB')) || [];
    tableBody.innerHTML = ""; 

    books.forEach(book => {
        const matchText = book.name.toLowerCase().includes(filterText.toLowerCase()) || 
                          book.author.toLowerCase().includes(filterText.toLowerCase());
        const matchCategory = filterCategory === "All" || book.category === filterCategory;

        if (matchText && matchCategory) {
            let statusClass = book.status === "Available" ? "status-available" : 
                              (book.status === "Reserved" ? "status-reserved" : "status-borrowed");
            
            let actionBtn = "";
            if (book.status === "Available") {
                actionBtn = `<button class="btn edit-btn" onclick="borrowBook(${book.id})">Borrow</button>`;
            } else {
                actionBtn = `<button class="btn btn-disabled" disabled>Unavailable</button>`;
            }

            let row = `<tr>
                <td>${book.id}</td>
                <td>${book.name}</td>
                <td>${book.author}</td>
                <td><span class="${statusClass}">${book.status}</span></td>
                <td>${actionBtn}</td>
            </tr>`;
            tableBody.innerHTML += row;
        }
    });
}

function loadUserDashboard() {
    const tableBody = document.getElementById('userBooksTableBody');
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!tableBody || !user) return; 

    document.getElementById('profileUsername').value = user.username;
    document.getElementById('profileEmail').value = user.email;

    const books = JSON.parse(localStorage.getItem('booksDB')) || [];
    tableBody.innerHTML = ""; 

    const borrowedBooks = books.filter(book => book.status === "Borrowed");

    if (borrowedBooks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">You have no borrowed books.</td></tr>`;
        return;
    }

    borrowedBooks.forEach(book => {
        let row = `<tr>
            <td>${book.id}</td>
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td><span class="status-borrowed">${book.status}</span></td>
            <td><button class="btn delete-btn" onclick="returnBook(${book.id})">Return</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function borrowBook(bookId) {
    let books = JSON.parse(localStorage.getItem('booksDB'));
    let bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex !== -1 && books[bookIndex].status === "Available") {
        books[bookIndex].status = "Borrowed";
        localStorage.setItem('booksDB', JSON.stringify(books));
        alert(`Success! You have borrowed '${books[bookIndex].name}'.`);
        loadSearchTable(); 
    }
}

function returnBook(bookId) {
    if (confirm("Do you want to return this book to the library?")) {
        let books = JSON.parse(localStorage.getItem('booksDB'));
        let bookIndex = books.findIndex(b => b.id === bookId);

        if (bookIndex !== -1 && books[bookIndex].status === "Borrowed") {
            books[bookIndex].status = "Available";
            localStorage.setItem('booksDB', JSON.stringify(books));
            alert("Book returned successfully. Thank you!");
            loadUserDashboard(); 
        }
    }
}

function searchBooks() {
    let inputText = document.getElementById("searchInput").value;
    let category = document.getElementById("categoryFilter").value;
    loadSearchTable(inputText, category);
}

document.addEventListener('submit', function(e) {
    if (e.target.id === 'userProfileForm') {
        e.preventDefault();
        
        let newName = document.getElementById('profileUsername').value.trim();
        let newEmail = document.getElementById('profileEmail').value.trim();

        if (newName === "" || newEmail === "") {
            alert("Please fill in all fields.");
            return;
        }

        if (!newEmail.includes('@')) {
            alert("Please enter a valid email address.");
            return;
        }
        
        let user = JSON.parse(sessionStorage.getItem('currentUser'));
        user.username = newName;
        user.email = newEmail;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        renderNavbar(); 
        
        alert("Success: Your profile information has been updated!");
    }
});

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = "login.html"; 
}

window.onload = function() {
    initializeDatabase();
    renderNavbar();
    loadSearchTable();
    loadUserDashboard();
};