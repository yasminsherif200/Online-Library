
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


const addForm = document.getElementById("add-book-form");
if (addForm) {
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        
        const title = document.getElementById("book_title").value.trim();
        const author = document.getElementById("book_author").value.trim();
        const isbn = document.getElementById("book_isbn").value.trim();
        const genre = document.getElementById("book_genre").value;
        const description = document.getElementById("book_description").value.trim();

        
        if (!title || !author || !genre) {
            alert("Title, Author, and Genre are required!");
            return;
        }

        
        const bookData = {
            title: title,
            author: author,
            isbn: isbn,
            genre: genre,
            description: description,
            cover: "" 
        };

        try {
            
           const response = await fetch('http://127.0.0.1:8000/api/books/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(bookData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`"${title}" added successfully!`);
                window.location.href = "/Books-Management/"; 
            } else {
                alert("Error: " + (result.message || "Method Not Allowed"));
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Connection error with server.");
        }
    });
}
