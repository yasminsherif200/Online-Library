requireAdmin();

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
function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  const books = getBooks();

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
      <td class="catalog-ref">#${book.id.toUpperCase()}</td>
      <td><strong>${book.title}</strong></td>
      <td>${book.author}</td>
      <td>${book.genre}</td>
      <td>
        <span class="badge ${book.available ? 'badge-available' : 'badge-borrowed'}">
          ${book.available ? 'Available' : 'Borrowed'}
        </span>
      </td>
      <td class="actions-cell">
        <a href="Edit-Book.html?id=${book.id}" class="btn edit-btn">
          <i class="fa-solid fa-pen"></i> Edit
        </a>
        <button class="btn delete-btn" data-id="${book.id}">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("books-count").textContent =
    `${books.length} book${books.length !== 1 ? "s" : ""} in archive`;

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const book = getBookById(btn.dataset.id);
      if (!book.available) {
        alert("Cannot delete a book that is currently borrowed.");
        return;
      }
      if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
        deleteBook(btn.dataset.id);
        loadBooks();
        alert("Book deleted successfully.");
      }
    });
  });
}

loadBooks();