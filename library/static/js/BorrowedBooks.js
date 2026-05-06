requireUser();

const session = getSession();

// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// Load stats
function loadStats() {
  const allBorrows     = getBorrows().filter(b => b.userEmail === session.email);
  const activeBorrows  = allBorrows.filter(b => !b.returnDate);
  const returnedBorrows = allBorrows.filter(b => b.returnDate);

  document.getElementById("stat-total").textContent    = allBorrows.length;
  document.getElementById("stat-active").textContent   = activeBorrows.length;
  document.getElementById("stat-returned").textContent = returnedBorrows.length;
}

// Load borrowed books table
function loadBorrowedBooks() {
  const tbody = document.getElementById("borrowed-tbody");
  const noMsg = document.getElementById("no-borrows-msg");
  const borrows = getUserBorrows(session.email);

  tbody.innerHTML = "";

  if (borrows.length === 0) {
    noMsg.classList.remove("hidden");
    return;
  }

  noMsg.classList.add("hidden");

  borrows.forEach(borrow => {
    const book = getBookById(borrow.bookId);
    if (!book) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="book-info">
          <img src="${book.cover}" class="book-cover" onerror="this.style.display='none'">
          <div>
            <strong>${book.title}</strong>
          </div>
        </div>
      </td>
      <td>${book.author}</td>
      <td><span class="tag">${book.genre}</span></td>
      <td><span class="status-on-loan">● On Loan</span></td>
      <td>
        <button class="return-btn" data-id="${book.id}">Return</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Return buttons
  document.querySelectorAll(".return-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const book = getBookById(btn.dataset.id);
      if (confirm(`Return "${book.title}"?`)) {
        returnBook(btn.dataset.id, session.email);
        loadBorrowedBooks();
        loadStats();
        alert(`"${book.title}" returned successfully!`);
      }
    });
  });
}

loadBorrowedBooks();
loadStats();