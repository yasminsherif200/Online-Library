
const sidebarToggle = document.querySelector(".iconbar-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
  sidebarToggle.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  sidebarToggle.classList.remove("active");
});

// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});



// Load books from Django API
async function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  
  try {
    
    const response = await fetch('/api/books/');
    const books = await response.json();

    tbody.innerHTML = "";

    if (books.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-msg">No books in the archive yet.</td>
        </tr>`;
      document.getElementById("books-count").textContent = "0 books";
      return;
    }

    books.forEach(book => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="catalog-ref">#${book.id}</td>
        <td><strong>${book.title}</strong></td>
        <td>${book.author}</td>
        <td>${book.genre}</td>
        <td>
          <span class="badge ${book.available ? 'badge-available' : 'badge-borrowed'}">
            ${book.available ? 'Available' : 'Borrowed'}
          </span>
        </td>
        <td class="actions-cell">
          <a href="/Edit-Book/?id=${book.id}" class="btn edit-btn">
            <i class="fa-solid fa-pen"></i> Edit
          </a>
          <button class="btn delete-btn" data-id="${book.id}" data-title="${book.title}" data-available="${book.available}">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("books-count").textContent =
      `${books.length} book${books.length !== 1 ? "s" : ""} in archive`;

    
    attachDeleteEvents();

  } catch (error) {
    console.error("Error loading books:", error);
    tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">Error loading books from server.</td></tr>`;
  }
}

function attachDeleteEvents() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const bookId = btn.dataset.id;
      const bookTitle = btn.dataset.title;
      const isAvailable = btn.dataset.available === "true";

      if (!isAvailable) {
        alert("Cannot delete a book that is currently borrowed.");
        return;
      }

      if (confirm(`Delete "${bookTitle}"? This cannot be undone.`)) {
        try {
          
          const response = await fetch(`/api/books/${bookId}/delete/`, {
            method: 'DELETE',
            headers: {
              'X-CSRFToken': getCookie('csrftoken') 
            }
          });

          if (response.ok) {
            alert("Book deleted successfully.");
            loadBooks(); 
          } else {
            alert("Failed to delete the book.");
          }
        } catch (error) {
          console.error("Error deleting book:", error);
        }
      }
    });
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

loadBooks();
