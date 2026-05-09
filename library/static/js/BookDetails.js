// must be logged in as user 
requireUser();

const session = getSession();

// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {

  e.preventDefault();

  logout();

  
  window.location.href = "/login/";

});


// load books from  Django API 
async function loadBooks() {

  const tbody = document.getElementById("books-tbody");

  tbody.innerHTML = "";

  try {

    // GET books from Django API
    const response = await fetch("/api/books/");

    const books = await response.json();

    // If there are no books 
    if (books.length === 0) {

      tbody.innerHTML = `
        <tr>
          <td colspan="6"
              style="text-align:center; padding:30px; color:#aaa;">
            No books available yet.
          </td>
        </tr>
      `;

      return;
    }

    // Book display
    books.forEach(book => {

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="book-info">

          <img
            src="${book.cover}"
            class="book-cover"
            onerror="this.style.display='none'"
          >

          <strong>${book.title}</strong>

        </td>

        <td>${book.author}</td>

        <td>
          <span class="tag">${book.genre}</span>
        </td>

        <td>
          ${book.description.substring(0, 50)}...
        </td>

        <td>

          <span class="status ${book.available ? 'available' : 'on-loan'}">

            ● ${book.available ? 'Available' : 'On Loan'}

          </span>

        </td>

        <td>

          ${
            book.available

            ? `<a href="#"
                 class="borrow-link"
                 data-id="${book.id}">
                 Borrow
               </a>`

            : `<span style="color:#aaa; font-size:0.85rem;">
                 Unavailable
               </span>`
          }

        </td>
      `;

      tbody.appendChild(tr);

    });

    // borrow buttons
    document.querySelectorAll(".borrow-link").forEach(link => {

      link.addEventListener("click", async (e) => {

        e.preventDefault();

        const bookId = link.dataset.id;

        // POST borrow request
        const response = await fetch("/api/borrows/", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            book_id: bookId
          })

        });

        // if the process successful 
        if (response.ok) {

          alert("Book borrowed successfully!");

          // refresh
          loadBooks();

        } else {

          alert("Failed to borrow book.");

        }

      });

    });

  } catch (error) {

    console.error(error);

    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          Error loading books.
        </td>
      </tr>
    `;
  }

}
loadBooks();
