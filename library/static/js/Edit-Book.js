
if (typeof requireAdmin === 'function') {
    requireAdmin();
}

// Sidebar toggle logic
const sidebarToggle = document.querySelector(".iconbar-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");
        sidebarToggle.classList.toggle("active");
    });
}

if (overlay) {
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        sidebarToggle.classList.remove("active");
    });
}

// Logout logic
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof logout === 'function') logout();
    });
}

// Get book ID from URL
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

const form       = document.getElementById("editBookForm");
const notFound   = document.getElementById("not-found-msg");



async function fetchBookData() {
    if (!bookId) {
        if (notFound) notFound.classList.remove("hidden");
        return;
    }

    try {
        const response = await fetch(`/api/books/${bookId}/`);
        if (!response.ok) {
            if (notFound) notFound.classList.remove("hidden");
            return;
        }

        const book = await response.json();
        
        
        if (form) {
            form.classList.remove("hidden");
            document.getElementById("bookID").value          = book.id;
            document.getElementById("bookTitle").value       = book.title;
            document.getElementById("bookAuthor").value      = book.author;
            document.getElementById("bookIsbn").value        = book.isbn || "";
            document.getElementById("bookDescription").value = book.description || "";

            const preview = document.getElementById("cover-preview");
            if (preview) preview.src = book.cover || "/static/imgs/book1.png";

            const genreSelect = document.getElementById("bookGenre");
            if (genreSelect) {
                for (let option of genreSelect.options) {
                    if (option.value === book.genre) {
                        option.selected = true;
                        break;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error fetching book:", error);
        if (notFound) notFound.classList.remove("hidden");
    }
}

fetchBookData();


if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title       = document.getElementById("bookTitle").value.trim();
        const author      = document.getElementById("bookAuthor").value.trim();
        const isbn        = document.getElementById("bookIsbn").value.trim();
        const genre       = document.getElementById("bookGenre").value;
        const description = document.getElementById("bookDescription").value.trim();

        if (!title || !author || !genre) {
            alert("Please fill in Title, Author, and Genre.");
            return;
        }

        const updatedData = {
            title: title,
            author: author,
            isbn: isbn,
            genre: genre,
            description: description
        };

        try {
            const response = await fetch(`/api/books/${bookId}/update/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert(`"${title}" updated successfully!`);
                window.location.href = "/Books-Management/"; 
            } else {
                const errorData = await response.json();
                alert("Error: " + (errorData.detail || "Failed to update book."));
            }
        } catch (error) {
            console.error("Error updating book:", error);
            alert("Connection error with the server.");
        }
    });
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
