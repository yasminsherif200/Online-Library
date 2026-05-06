requireUser();

const session = getSession();

document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");
  if (query) {
    document.getElementById("search-title").value = query;
    runSearch();
  }
});

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch();
});

function runSearch() {
  const titleQuery  = document.getElementById("search-title").value.trim().toLowerCase();
  const authorQuery = document.getElementById("search-author").value.trim().toLowerCase();
  const genreQuery  = document.getElementById("search-genre").value.toLowerCase();

  const results = getBooks().filter(book => {
    const matchTitle  = titleQuery  ? book.title.toLowerCase().includes(titleQuery)   : true;
    const matchAuthor = authorQuery ? book.author.toLowerCase().includes(authorQuery) : true;
    const matchGenre  = genreQuery  ? book.genre.toLowerCase() === genreQuery         : true;
    return matchTitle && matchAuthor && matchGenre;
  });

  displayResults(results);
}

function displayResults(results) {
  const section  = document.getElementById("results-section");
  const tbody    = document.getElementById("results-tbody");
  const noMsg    = document.getElementById("no-results-msg");
  const countMsg = document.getElementById("results-count");

  tbody.innerHTML = "";

  if (results.length === 0) {
    section.classList.add("hidden");
    noMsg.classList.remove("hidden");
    return;
  }

  noMsg.classList.add("hidden");
  section.classList.remove("hidden");
  countMsg.textContent = `${results.length} book${results.length !== 1 ? "s" : ""} found`;

  results.forEach(book => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${book.title}</strong></td>
      <td>${book.author}</td>
      <td>${book.genre}</td>
      <td class="${book.available ? 'status-available' : 'status-unavailable'}">
        ${book.available ? "Available" : "On Loan"}
      </td>
      <td>
        ${book.available
          ? `<button class="btn borrow-btn" data-id="${book.id}">Borrow</button>`
          : `<span class="unavailable-text">Unavailable</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".borrow-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const book = getBookById(btn.dataset.id);
      if (confirm(`Borrow "${book.title}"?`)) {
        const result = borrowBook(btn.dataset.id, session.email);
        if (result.success) {
          alert(`"${book.title}" added to your library!`);
          runSearch();
        } else {
          alert(result.msg);
        }
      }
    });
  });
}