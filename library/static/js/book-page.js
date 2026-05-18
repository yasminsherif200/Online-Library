// ── CSRF helper ──────────────────────────────────────────────
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

// ── Route guard ──────────────────────────────────────────────
async function requireUser() {
  try {
    const res = await fetch("/api/auth/me/", { credentials: "include" });
    if (!res.ok) { window.location.href = "/login/"; return null; }
    const data = await res.json();
    if (!data || data.role !== "user") { window.location.href = "/login/"; return null; }
    return data;
  } catch (err) {
    window.location.href = "/login/";
    return null;
  }
}

// ── Logout ───────────────────────────────────────────────────
document.getElementById("logout-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  window.location.href = "/";
});

// ── Load book ────────────────────────────────────────────────
async function loadBook(bookId, userEmail) {
  try {
    const res = await fetch(`/api/books/${bookId}/`, { credentials: "include" });
    if (!res.ok) throw new Error("Not found");
    const book = await res.json();

    // Fill in the details
    document.getElementById("breadcrumb-title").textContent = book.title;
    document.getElementById("book-cover").src              = book.cover;
    document.getElementById("book-title").textContent      = book.title;
    document.getElementById("book-author").textContent     = `by ${book.author}`;
    document.getElementById("book-genre").textContent      = book.genre;
    document.getElementById("book-isbn").textContent       = book.isbn || "—";
    document.getElementById("book-description").textContent = book.description || "No description available.";

    // Status badge
    const badge = document.getElementById("status-badge");
    if (book.available) {
      badge.textContent = "● AVAILABLE";
      badge.classList.add("available");
    } else {
      badge.textContent = "● ON LOAN";
      badge.classList.add("on-loan");
    }

    // Borrow button
    const borrowBtn = document.getElementById("borrow-btn");
    if (!book.available) {
      borrowBtn.textContent = "Currently Unavailable";
      borrowBtn.disabled = true;
    } else {
      borrowBtn.addEventListener("click", async () => {
        if (confirm(`Borrow "${book.title}"?`)) {
          try {
            const r = await fetch("/api/borrows/", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
              },
              body: JSON.stringify({ book_id: bookId }),
            });
            const data = await r.json();
            if (data.success) {
              alert(`"${book.title}" has been added to your library!`);
              window.location.reload();
            } else {
              alert(data.message);
            }
          } catch (err) {
            alert("Something went wrong. Please try again.");
          }
        }
      });
    }

    // Show the content
    document.getElementById("book-content").classList.remove("hidden");

  } catch (err) {
    document.getElementById("not-found-msg").classList.remove("hidden");
  }
}

// ── Init ─────────────────────────────────────────────────────
(async () => {
  const user = await requireUser();
  if (!user) return;

  const pathParts = window.location.pathname.split('/');
  const bookId = pathParts[pathParts.indexOf('book') + 1];

  if (!bookId) {
    document.getElementById("not-found-msg").classList.remove("hidden");
    return;
  }

  loadBook(bookId, user.email);
})();