// Route guard
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

function getCsrfToken() {
  return document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content") || "";
}

(async () => {
  const session = await requireUser();
  if (!session) return; 

// Fill in user info
document.getElementById("display-username").value = session.username;
document.getElementById("display-email").value = session.email;

document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    window.location.href = "/login/";
  });

 //Load borrowed books
  loadBorrowedBooks(session);
})();

async function loadBorrowedBooks(session) {
  const tbody = document.getElementById("borrowed-tbody");
  const noMsg = document.getElementById("no-borrows-msg");
 
  tbody.innerHTML = "";
 
  let borrows = [];
  try {
    const res = await fetch("/api/borrows/", { credentials: "include" });
    if (res.ok) {
      borrows = await res.json();
    }
  } catch {

  }
 
  const activeBorrows = borrows.filter((b) => !b.returnDate);
 
  if (activeBorrows.length === 0) {
    noMsg.style.display = "block";
    return;
  }
 
  noMsg.style.display = "none";
 
  for (const borrow of activeBorrows) {
    let book = null;
    try {
      const res = await fetch(`/api/books/${borrow.bookId}/`, {
        credentials: "include",
      });
      if (res.ok) book = await res.json();
    } catch {
      continue;
    }
    if (!book) continue;
 
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td><span style="color:#b08d57; font-weight:bold;">Borrowed</span></td>
      <td>
        <button class="btn delete-btn" data-id="${book.id}">Return</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Do you want to return this book?")) {
        try {
          const res = await fetch(`/api/borrows/${btn.dataset.id}/return/`, {
            method: "POST",
            credentials: "include",
            headers: { "X-CSRFToken": getCsrfToken() },
          });
          if (res.ok) {
            loadBorrowedBooks(session);
            alert("Book returned successfully!");
          } else {
            alert("Could not return book. Please try again.");
          }
        } catch {
          alert("Network error. Please try again.");
        }
      }
    });
  });
}