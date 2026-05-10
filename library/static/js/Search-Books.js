// Route guard 
async function requireUser() {
  try {
    const res = await fetch("/api/auth/me/", { credentials: "include" });
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
  return (
    document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content") || ""
  );
}
let currentSession = null;

(async () => {
  currentSession = await requireUser();
  if (!currentSession) return;

  document.getElementById("logout-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    window.location.href = "/login/";
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");
  if (query) {
    document.getElementById("search-title").value = query;
    await runSearch();
  }
})();

//Search form 
document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await runSearch();
});

async function runSearch() {
  const titleQuery = document.getElementById("search-title").value.trim();
  const authorQuery = document.getElementById("search-author").value.trim();
  const genreQuery = document.getElementById("search-genre").value;

  const params = new URLSearchParams();
  if (titleQuery) params.set("title", titleQuery);
  if (authorQuery) params.set("author", authorQuery);
  if (genreQuery) params.set("genre", genreQuery);

  let results = [];
  try {
    const res = await fetch(
      `/api/books/search/?${params.toString()}`,
      { credentials: "include" }
    );
    if (res.ok) {
      results = await res.json();
    }
  } catch {

  }

  displayResults(results);
}

//displayResults 
function displayResults(results) {
  const section = document.getElementById("results-section");
  const tbody = document.getElementById("results-tbody");
  const noMsg = document.getElementById("no-results-msg");
  const countMsg = document.getElementById("results-count");

  tbody.innerHTML = "";

  if (results.length === 0) {
    section.classList.add("hidden");
    noMsg.classList.remove("hidden");
    return;
  }

  noMsg.classList.add("hidden");
  section.classList.remove("hidden");
  countMsg.textContent = `${results.length} book${
    results.length !== 1 ? "s" : ""
  } found`;

  results.forEach((book) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${book.title}</strong></td>
      <td>${book.author}</td>
      <td>${book.genre}</td>
      <td class="${book.available ? "status-available" : "status-unavailable"}">
        ${book.available ? "Available" : "On Loan"}
      </td>
      <td>
        ${
          book.available
            ? `<button class="btn borrow-btn" data-id="${book.id}">Borrow</button>`
            : `<span class="unavailable-text">Unavailable</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });

  //Borrow button logic 
  document.querySelectorAll(".borrow-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const bookId = btn.dataset.id;
      const book = results.find((b) => b.id === bookId);
      if (confirm(`Borrow "${book?.title}"?`)) {
        try {
          const res = await fetch("/api/borrows/", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCsrfToken(),
            },
            body: JSON.stringify({ book_id: bookId }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            alert(`"${book?.title}" added to your library!`);
            await runSearch();
          } else {
            alert(data.message || "Could not borrow book. Please try again.");
          }
        } catch {
          alert("Network error. Please try again.");
        }
      }
    });
  });
}