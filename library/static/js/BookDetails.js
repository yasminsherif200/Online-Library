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

async function requireUserSession() {
  try {
    const res = await fetch("/api/auth/me/", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "/login/";
      return null;
    }
    const user = await res.json();
    if (!user.success || user.role !== "user") {
      window.location.href = "/login/";
      return null;
    }
    return user;
  } catch {
    window.location.href = "/login/";
    return null;
  }
}

async function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  tbody.innerHTML = "";

  try {
    const response = await fetch("/api/books/", { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load books");

    const books = await response.json();

    if (books.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:30px; color:#aaa;">
            No books available yet.
          </td>
        </tr>`;
      return;
    }

    books.forEach((book) => {
      const tr = document.createElement("tr");
      const desc = book.description || "";
      const shortDesc = desc.length > 50 ? desc.substring(0, 50) + "..." : desc;

      tr.innerHTML = `
        <td class="book-info">
          <img src="${book.cover || ""}" class="book-cover" onerror="this.style.display='none'">
          <strong>${book.title}</strong>
        </td>
        <td>${book.author}</td>
        <td><span class="tag">${book.genre}</span></td>
        <td>${shortDesc}</td>
        <td>
          <span class="status ${book.available ? "available" : "on-loan"}">
            ● ${book.available ? "Available" : "On Loan"}
          </span>
        </td>
        <td>
          ${
            book.available
              ? `<a href="#" class="borrow-link" data-id="${book.id}">Borrow</a>`
              : `<span style="color:#aaa; font-size:0.85rem;">Unavailable</span>`
          }
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".borrow-link").forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const bookId = link.dataset.id;
        const book = books.find((b) => String(b.id) === String(bookId));
        if (!confirm(`Borrow "${book?.title}"?`)) return;

        try {
          const response = await fetch("/api/borrows/", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken") || "",
            },
            body: JSON.stringify({ book_id: bookId }),
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok && data.success) {
            alert("Book borrowed successfully!");
            loadBooks();
          } else {
            alert(data.message || "Failed to borrow book.");
          }
        } catch (err) {
          console.error(err);
          alert("Something went wrong. Please try again.");
        }
      });
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6">Error loading books.</td>
      </tr>`;
  }
}

(async () => {
  const session = await requireUserSession();
  if (!session) return;

  document.getElementById("logout-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": getCookie("csrftoken") || "" },
      });
    } catch (err) {
      console.error(err);
    }
    window.location.href = "/login/";
  });

  await loadBooks();
})();
