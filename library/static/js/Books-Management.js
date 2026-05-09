requireAdmin();

const API_BASE = "http://127.0.0.1:8000";

// Sidebar toggle
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

// Load books
async function loadBooks() {
  const tbody = document.getElementById("books-tbody");

  try {
    const response = await fetch(`${API_BASE}/api/books/`);
    if (!response.ok) throw new Error("Failed to fetch books");

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

    books.forEach((book) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="catalog-ref">#${String(book.id).toUpperCase()}</td>
        <td><strong>${book.title}</strong></td>
        <td>${book.author}</td>
        <td>${book.genre}</td>
        <td>
          <span class="badge ${book.available ? "badge-available" : "badge-borrowed"}">
            ${book.available ? "Available" : "Borrowed"}
          </span>
        </td>
        <td class="actions-cell">
          <a href="/edit-book/?id=${book.id}" class="btn edit-btn">
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

    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const available = btn.dataset.available === "true";
        const title = btn.dataset.title;
        const id = btn.dataset.id;

        if (!available) {
          alert("Cannot delete a book that is currently borrowed.");
          return;
        }

        if (confirm(`Delete "${title}"? This cannot be undone.`)) {
          await deleteBook(id);
        }
      });
    });

  } catch (error) {
    console.error("Error loading books:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-msg">Failed to load books. Please try again.</td>
      </tr>`;
  }
}

async function deleteBook(bookId) {
  try {
    const response = await fetch(`${API_BASE}/api/books/${bookId}/delete/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to delete book");

    alert("Book deleted successfully.");
    loadBooks();
  } catch (error) {
    console.error("Error deleting book:", error);
    alert("Failed to delete book. Please try again.");
  }
}

loadBooks();
