function getCsrfToken() {
  return (
    document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content") || ""
  );
}

async function requireUser() {
  try {
    const res = await fetch("/api/auth/me/", {
      credentials: "include",
    });
    if (!res.ok) {
      window.location.href = "/login/";
      return null;
    }
    const user = await res.json();
    if (!user || user.role !== "user") {
      window.location.href = "/login/";
      return null;
    }
    return user;
  } catch {
    window.location.href = "/login/";
    return null;
  }
}

async function loadBorrowedBooks() {
  const tbody = document.getElementById("borrowed-tbody");
  const noMsg = document.getElementById("no-borrows-msg");

  tbody.innerHTML = "";

  let borrows = [];
  try {
    const res = await fetch("/api/borrows/mine/", { credentials: "include" });
    if (res.ok) {
      borrows = await res.json();
    }
  } catch {
    borrows = [];
  }

  if (borrows.length === 0) {
    noMsg.style.display = "block";
    return;
  }

  noMsg.style.display = "none";

  for (const borrow of borrows) {
    const book = borrow.book;
    if (!book) continue;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td><span style="color:#b08d57; font-weight:bold;">Borrowed</span></td>
      <td>
        <button class="btn delete-btn" data-borrow-id="${borrow.id}">Return</button>
      </td>`;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Do you want to return this book?")) return;
      const borrowId = btn.dataset.borrowId;
      try {
        const res = await fetch(
          `/api/borrows/${encodeURIComponent(borrowId)}/return/`,
          {
            method: "POST",
            credentials: "include",
            headers: { "X-CSRFToken": getCsrfToken() },
          }
        );
        if (res.ok) {
          alert("Book returned successfully!");
          loadBorrowedBooks();
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.message || "Could not return book. Please try again.");
        }
      } catch {
        alert("Network error. Please try again.");
      }
    });
  });
}

(async () => {
  const session = await requireUser();
  if (!session) return;

  document.getElementById("display-username").value = session.username;
  document.getElementById("display-email").value = session.email;

  document.getElementById("logout-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    window.location.href = "/login/";
  });

  await loadBorrowedBooks();
})();
