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
  } catch {
    window.location.href = "/login/";
    return false;
  }
}

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

document.getElementById("logout-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
  } catch (err) {
    console.error(err);
  }
  window.location.href = "/";
});

async function deleteBook(bookId) {
  try {
    const response = await fetch(`/api/books/${encodeURIComponent(bookId)}/delete/`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
    });

    if (!response.ok) throw new Error("Failed to delete book");

    alert("Book deleted successfully.");
    loadBooks();
  } catch (error) {
    console.error("Error deleting book:", error);
    alert("Failed to delete book. Please try again.");
  }
}

async function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  
  try {
    const response = await fetch("/api/books/", { credentials: "include" });
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
    tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">Error loading books from server.</td></tr>`;
  }
}

(async () => {
  const ok = await requireAdmin();
  if (ok) loadBooks();
})();
