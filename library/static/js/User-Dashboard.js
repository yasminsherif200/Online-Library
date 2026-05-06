// Route guard
requireUser();

const session = getSession();

// Fill in user info
document.getElementById("display-username").value = session.username;
document.getElementById("display-email").value = session.email;

// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// Load borrowed books
function loadBorrowedBooks() {
  const tbody = document.getElementById("borrowed-tbody");
  const noMsg = document.getElementById("no-borrows-msg");
  const borrows = getUserBorrows(session.email);

  tbody.innerHTML = "";

  if (borrows.length === 0) {
    noMsg.style.display = "block";
    return;
  }

  noMsg.style.display = "none";

  borrows.forEach(borrow => {
    const book = getBookById(borrow.bookId);
    if (!book) return;

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
  });

  // Return button logic
  tbody.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("Do you want to return this book?")) {
        returnBook(btn.dataset.id, session.email);
        loadBorrowedBooks(); // refresh table
        alert("Book returned successfully!");
      }
    });
  });
}

loadBorrowedBooks();