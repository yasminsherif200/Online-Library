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

// Load stats
function loadStats() {
  const books    = getBooks();
  const users    = getUsers().filter(u => u.role === "user");
  const borrowed = books.filter(b => !b.available);
  const available = books.filter(b => b.available);

  document.getElementById("stat-total-books").textContent = books.length;
  document.getElementById("stat-borrowed").textContent    = borrowed.length;
  document.getElementById("stat-available").textContent   = available.length;
  document.getElementById("stat-users").textContent       = users.length;
}

// Load books table
function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  const books = getBooks();

  tbody.innerHTML = "";

  if (books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#aaa; padding:30px;">No books in the archive yet.</td></tr>`;
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
      <td style="position:relative;">
        <button class="action-btn" data-id="${book.id}">···</button>
        <div class="action-menu" id="menu-${book.id}" style="display:none;">
          <a href="Edit-Book.html?id=${book.id}"><i class="fa-solid fa-pen"></i> Edit</a>
          <a href="#" class="delete-link" data-id="${book.id}">
            <i class="fa-solid fa-trash"></i> Delete
          </a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("books-count").textContent =
    `${books.length} book${books.length !== 1 ? "s" : ""} in archive`;

  attachListeners();
}

function attachListeners() {
  document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".action-menu").forEach(m => m.style.display = "none");
      const menu = document.getElementById("menu-" + btn.dataset.id);
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".action-menu").forEach(m => m.style.display = "none");
  });

  document.querySelectorAll(".delete-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const book = getBookById(link.dataset.id);
      if (!book.available) {
        alert("Cannot delete a book that is currently borrowed.");
        return;
      }
      if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
        deleteBook(link.dataset.id);
        loadBooks();
        loadStats();
      }
    });
  });
}

loadStats();
loadBooks();