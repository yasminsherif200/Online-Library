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

async function loadStats() {
  try {
    const response = await fetch("/api/borrows/stats/", {
      credentials: "include",
    });
    if (!response.ok) return;
    const stats = await response.json();
    document.getElementById("stat-total").textContent = stats.total ?? 0;
    document.getElementById("stat-active").textContent = stats.active ?? 0;
    document.getElementById("stat-returned").textContent = stats.returned ?? 0;
  } catch (error) {
    console.error(error);
  }
}

async function loadBorrowedBooks() {
  const tbody = document.getElementById("borrowed-tbody");
  const noMsg = document.getElementById("no-borrows-msg");

  tbody.innerHTML = "";

  try {
    const response = await fetch("/api/borrows/mine/", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to load borrows");

    const borrows = await response.json();

    if (borrows.length === 0) {
      noMsg.classList.remove("hidden");
      return;
    }

    noMsg.classList.add("hidden");

    borrows.forEach((borrow) => {
      const book = borrow.book;
      if (!book) return;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="book-info">
            <img src="${book.cover || ""}" class="book-cover" onerror="this.style.display='none'">
            <div><strong>${book.title}</strong></div>
          </div>
        </td>
        <td>${book.author}</td>
        <td><span class="tag">${book.genre}</span></td>
        <td><span class="status-on-loan">● On Loan</span></td>
        <td>
          <button class="return-btn" data-borrow-id="${borrow.id}">Return</button>
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".return-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const borrowId = btn.dataset.borrowId;
        try {
          const response = await fetch(
            `/api/borrows/${encodeURIComponent(borrowId)}/return/`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "X-CSRFToken": getCookie("csrftoken") || "",
              },
            }
          );
          if (response.ok) {
            alert("Book returned successfully!");
            await loadBorrowedBooks();
            await loadStats();
          } else {
            const data = await response.json().catch(() => ({}));
            alert(data.message || "Failed to return book.");
          }
        } catch (error) {
          console.error(error);
          alert("Something went wrong.");
        }
      });
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Error loading borrowed books.</td>
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

  await loadBorrowedBooks();
  await loadStats();
})();
