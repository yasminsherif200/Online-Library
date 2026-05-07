// ─── Route Guard ───────────────────────────────────────────────────────────
// Check session via API instead of localStorage
async function requireAdmin() {
  try {
    const res = await fetch("/api/session/", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "/login/";
      return false;
    }
    const data = await res.json();
    if (!data || data.role !== "admin") {
      window.location.href = "/login/";
      return false;
    }
    return true;
  } catch (err) {
    window.location.href = "/login/";
    return false;
  }
}

// ─── Logout ─────────────────────────────────────────────────────────────────
document.getElementById("logout-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await fetch("/api/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  window.location.href = "/";
});

// ─── Sidebar toggle ──────────────────────────────────────────────────────────
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

// ─── Helper: get CSRF cookie ─────────────────────────────────────────────────
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ─── Load & Render Books ─────────────────────────────────────────────────────
async function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#aaa; padding:30px;">Loading...</td></tr>`;

  let books = [];
  let borrows = [];

  try {
    // GET /api/books/ — fetches all books from Django API
    const booksRes = await fetch("/api/books/", { credentials: "include" });
    if (!booksRes.ok) throw new Error("Failed to load books");
    books = await booksRes.json();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#e74c3c; padding:30px;">Error loading books. Please try again.</td></tr>`;
    console.error(err);
    return;
  }

  try {
    const borrowsRes = await fetch("/api/borrows/", { credentials: "include" });
    if (borrowsRes.ok) {
      borrows = await borrowsRes.json();
    }
  } catch (err) {
    console.warn("Could not load borrows:", err);
  }

  tbody.innerHTML = "";

  if (books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#aaa; padding:30px;">No books in the archive yet.</td></tr>`;
    updateFooter(0);
    return;
  }

  books.forEach((book) => {
    // Find active borrow for this book
    const activeBorrow = borrows.find(
      (b) => b.bookId === book.id && !b.returnDate
    );
    const borrowerEmail = activeBorrow ? activeBorrow.userEmail : null;

    const initials = borrowerEmail
      ? borrowerEmail.substring(0, 2).toUpperCase()
      : "--";

    const archiveDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="catalog-ref">#${String(book.id).toUpperCase()}</td>
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
        <span class="badge ${book.available ? "badge-available" : "badge-borrowed"}">
          ${book.available ? "Available" : "Borrowed"}
        </span>
      </td>
      <td>
        ${
          borrowerEmail
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
          <a href="/edit-book/?id=${book.id}"><i class="fa-solid fa-pen"></i> Edit</a>
          <a href="#" class="delete-link" data-id="${book.id}" style="color:#c0392b;">
            <i class="fa-solid fa-trash"></i> Delete
          </a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateFooter(books.length);
  attachActionListeners(books);
}

function updateFooter(count) {
  const footer = document.querySelector(".table-footer p");
  if (footer)
    footer.textContent = `Displaying ${count} book${count !== 1 ? "s" : ""} in archive`;
}

function attachActionListeners(books) {
  // Toggle action menus
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      document
        .querySelectorAll(".action-menu")
        .forEach((m) => (m.style.display = "none"));
      const menu = document.getElementById("menu-" + id);
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    });
  });

  // Close menus on outside click
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".action-menu")
      .forEach((m) => (m.style.display = "none"));
  });

  // Delete links
  document.querySelectorAll(".delete-link").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = link.dataset.id;
      const book = books.find((b) => String(b.id) === String(id));

      if (book && !book.available) {
        alert("Cannot delete a book that is currently borrowed.");
        return;
      }

      if (confirm(`Delete "${book ? book.title : "this book"}"? This cannot be undone.`)) {
        try {
          const res = await fetch(`/api/books/${id}/`, {
            method: "DELETE",
            credentials: "include",
            headers: { "X-CSRFToken": getCookie("csrftoken") },
          });
          if (!res.ok) throw new Error("Delete failed");
          loadBooks();
        } catch (err) {
          alert("Failed to delete book. Please try again.");
          console.error(err);
        }
      }
    });
  });
}

// ─── Init ────────────────────────────────────────────────────────────────────
(async () => {
  const ok = await requireAdmin();
  if (ok) loadBooks();
})();
