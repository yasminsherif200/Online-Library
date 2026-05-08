// ─── Route Guard ───────────────────────────────────────────────────────────
async function requireAdmin() {
  try {
    const res = await fetch("/api/auth/me/", { credentials: "include" });
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

// ─── Logout ─────────────────────────────────────────────────────────────────
document.getElementById("logout-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await fetch("api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  window.location.href = "/";
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

// ─── Load Stats ──────────────────────────────────────────────────────────────
// GET /api/admin/stats/ — fetches total books, total users, active borrows
async function loadStats() {
  try {
    const res = await fetch("/api/admin/stats/", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load stats");
    const stats = await res.json();

    // Expected response shape: { total_books, total_users, active_borrows, available_books }
    document.getElementById("stat-total-books").textContent =
      stats.total_books ?? 0;
    document.getElementById("stat-borrowed").textContent =
      stats.borrowed ?? 0;
    document.getElementById("stat-available").textContent =
      stats.available ?? (stats.total_books - stats.borrowed) ?? 0;
    document.getElementById("stat-users").textContent =
      stats.total_users ?? 0;
  } catch (err) {
    console.error("Stats error:", err);
    // Set zeros on failure so UI doesn't break
    ["stat-total-books", "stat-borrowed", "stat-available", "stat-users"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "—";
      }
    );
  }
}

// ─── Load Books Table ────────────────────────────────────────────────────────
async function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#aaa; padding:30px;">Loading...</td></tr>`;

  let books = [];

  try {
    const res = await fetch("/api/books/", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load books");
    books = await res.json();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#e74c3c; padding:30px;">Error loading books. Please try again.</td></tr>`;
    console.error(err);
    return;
  }

  tbody.innerHTML = "";

  if (books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#aaa; padding:30px;">No books in the archive yet.</td></tr>`;
    const countEl = document.getElementById("books-count");
    if (countEl) countEl.textContent = "0 books";
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
      <td style="position:relative;">
        <button class="action-btn" data-id="${book.id}">···</button>
        <div class="action-menu" id="menu-${book.id}" style="display:none;">
          <a href="/Edit-Book/?id=${book.id}"><i class="fa-solid fa-pen"></i> Edit</a>
          <a href="#" class="delete-link" data-id="${book.id}">
            <i class="fa-solid fa-trash"></i> Delete
          </a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const countEl = document.getElementById("books-count");
  if (countEl)
    countEl.textContent = `${books.length} book${books.length !== 1 ? "s" : ""} in archive`;

  attachListeners(books);
}

function attachListeners(books) {
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".action-menu")
        .forEach((m) => (m.style.display = "none"));
      const menu = document.getElementById("menu-" + btn.dataset.id);
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    });
  });

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".action-menu")
      .forEach((m) => (m.style.display = "none"));
  });

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
          const res = await fetch(`/api/books/${id}/delete/`, {
            method: "DELETE",
            credentials: "include",
            headers: { "X-CSRFToken": getCookie("csrftoken") },
          });
          if (!res.ok) throw new Error("Delete failed");
          // Reload both table and stats after deletion
          loadBooks();
          loadStats();
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
  if (ok) {
    loadStats();
    loadBooks();
  }
})();
