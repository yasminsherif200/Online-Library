requireAdmin();

// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

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

// Render books
function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  const books = getBooks();
  const borrows = getBorrows();

  tbody.innerHTML = "";

  if (books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#aaa; padding:30px;">No books in the archive yet.</td></tr>`;
    updateFooter(0);
    return;
  }

  books.forEach(book => {
    // Find active borrow for this book
    const activeBorrow = borrows.find(b => b.bookId === book.id && !b.returnDate);
    const borrowerEmail = activeBorrow ? activeBorrow.userEmail : null;

    // Get borrower initials from email
    const initials = borrowerEmail
      ? borrowerEmail.substring(0, 2).toUpperCase()
      : "--";

    const archiveDate = new Date().toLocaleDateString("en-US", {
      month: "short", day: "2-digit", year: "numeric"
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="catalog-ref">#${book.id.toUpperCase()}</td>
      <td>
        <div class="book-info">
          <div class="book-thumb">
            <img src="${book.cover}" onerror="this.style.display='none'" />
          </div>
          <div>
            <h4>${book.title}</h4>
            <p>${book.author} • ${book.genre}</p>
          </div>
        </div>
      </td>
      <td>
        <span class="badge ${book.available ? 'badge-available' : 'badge-borrowed'}">
          ${book.available ? 'Available' : 'Borrowed'}
        </span>
      </td>
      <td>
        ${borrowerEmail
          ? `<div class="borrower">
               <div class="borrower-avatar">${initials}</div>
               <span>${borrowerEmail}</span>
             </div>`
          : `<span style="color:#ccc;">—</span>`
        }
      </td>
      <td class="archive-date">${archiveDate}</td>
      <td style="position:relative;">
        <button class="action-btn" data-id="${book.id}">···</button>
        <div class="action-menu" id="menu-${book.id}" style="display:none;">
          <a href="Edit-Book.html?id=${book.id}"><i class="fa-solid fa-pen"></i> Edit</a>
          <a href="#" class="delete-link" data-id="${book.id}" style="color:#c0392b;">
            <i class="fa-solid fa-trash"></i> Delete
          </a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateFooter(books.length);
  attachActionListeners();
}

function updateFooter(count) {
  const footer = document.querySelector(".table-footer p");
  if (footer) footer.textContent = `Displaying ${count} book${count !== 1 ? "s" : ""} in archive`;
}

function attachActionListeners() {
  // Toggle action menus
  document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      // Close all other menus first
      document.querySelectorAll(".action-menu").forEach(m => m.style.display = "none");
      const menu = document.getElementById("menu-" + id);
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    });
  });

  // Close menus on outside click
  document.addEventListener("click", () => {
    document.querySelectorAll(".action-menu").forEach(m => m.style.display = "none");
  });

  // Delete links
  document.querySelectorAll(".delete-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.dataset.id;
      const book = getBookById(id);
      if (!book.available) {
        alert("Cannot delete a book that is currently borrowed.");
        return;
      }
      if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
        deleteBook(id);
        loadBooks();
      }
    });
  });
}

loadBooks();