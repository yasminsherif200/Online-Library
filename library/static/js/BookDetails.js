// must be logged in as user
requireUser();

const session = getSession();

// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// Render books
function loadBooks() {
  const tbody = document.getElementById("books-tbody");
  const books = getBooks();

  tbody.innerHTML = "";

  if (books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#aaa;">No books available yet.</td></tr>`;
    return;
  }

  books.forEach(book => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="book-info">
        <img src="${book.cover}" class="book-cover" onerror="this.style.display='none'">
        <strong>${book.title}</strong>
      </td>
      <td>${book.author}</td>
      <td><span class="tag">${book.genre}</span></td>
      <td>${book.description.substring(0, 50)}...</td>
      <td>
        <span class="status ${book.available ? 'available' : 'on-loan'}">
          ● ${book.available ? 'Available' : 'On Loan'}
        </span>
      </td>
      <td>
        ${book.available
          ? `<a href="#" class="borrow-link" data-id="${book.id}">Borrow</a>`
          : `<span style="color:#aaa; font-size:0.85rem;">Unavailable</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Borrow button logic
  document.querySelectorAll(".borrow-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const bookId = link.dataset.id;
      const book = getBookById(bookId);

      if (confirm(`Borrow "${book.title}"?`)) {
        const result = borrowBook(bookId, session.email);
        if (result.success) {
          alert(`"${book.title}" has been added to your library!`);
          loadBooks(); // refresh table
        } else {
          alert(result.msg);
        }
      }
    });
  });
}

loadBooks();