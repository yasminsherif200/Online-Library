// must be logged in as user 
requireUser();

const session = getSession();


// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {

  e.preventDefault();

  logout();

  // the new  redirect
  window.location.href = "/login/";

});


// Load stats
async function loadStats() {

  try {

    //Retrieve the user's borrowed books
    const response = await fetch("/api/borrows/mine/");

    const borrows = await response.json();

    // book division 
    const activeBorrows =
      borrows.filter(b => !b.return_date);

    const returnedBorrows =
      borrows.filter(b => b.return_date);

    // View statistics
    document.getElementById("stat-total").textContent =
      borrows.length;

    document.getElementById("stat-active").textContent =
      activeBorrows.length;

    document.getElementById("stat-returned").textContent =
      returnedBorrows.length;

  } catch (error) {

    console.error(error);

  }

}



// Load borrowed books table
async function loadBorrowedBooks() {

  const tbody =
    document.getElementById("borrowed-tbody");

  const noMsg =
    document.getElementById("no-borrows-msg");

  tbody.innerHTML = "";

  try {

    // GET borrows from API
    const response =
      await fetch("/api/borrows/mine/");

    const borrows = await response.json();

    // if there are no books 
    if (borrows.length === 0) {

      noMsg.classList.remove("hidden");

      return;
    }

    noMsg.classList.add("hidden");



    //book display 
    borrows.forEach(borrow => {

      // book details from API 
      const book = borrow.book;

      const tr = document.createElement("tr");

      tr.innerHTML = `

        <td>

          <div class="book-info">

            <img
              src="${book.cover}"
              class="book-cover"
              onerror="this.style.display='none'"
            >

            <div>
              <strong>${book.title}</strong>
            </div>

          </div>

        </td>


        <td>${book.author}</td>


        <td>
          <span class="tag">
            ${book.genre}
          </span>
        </td>


        <td>

          <span class="status-on-loan">
            ● On Loan
          </span>

        </td>


        <td>

          <button
            class="return-btn"
            data-id="${borrow.id}"
          >
            Return
          </button>

        </td>

      `;

      tbody.appendChild(tr);

    });



    // return buttons
    document.querySelectorAll(".return-btn").forEach(btn => {

      btn.addEventListener("click", async () => {

        const borrowId = btn.dataset.id;

        try {

          // POST return request
          const response = await fetch(

            `/api/borrows/${borrowId}/return/`,

            {
              method: "POST"
            }

          );
          if (response.ok) {

            alert("Book returned successfully!");

            // refresh
            loadBorrowedBooks();

            loadStats();

          } else {

            alert("Failed to return book.");

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
        <td colspan="5">
          Error loading borrowed books.
        </td>
      </tr>
    `;
  }

}
loadBorrowedBooks();

loadStats();
