requireAdmin();

// Sidebar toggle
const sidebarToggle = document.querySelector(".iconbar-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
  sidebarToggle.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  sidebarToggle.classList.remove("active");
});

// Logout
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// Get book ID from URL
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

const form       = document.getElementById("editBookForm");
const notFound   = document.getElementById("not-found-msg");

if (!bookId) {
  notFound.classList.remove("hidden");
} else {
  const book = getBookById(bookId);

  if (!book) {
    notFound.classList.remove("hidden");
  } else {
    // Show form and fill in current values
    form.classList.remove("hidden");

    document.getElementById("bookID").value          = book.id;
    document.getElementById("bookTitle").value       = book.title;
    document.getElementById("bookAuthor").value      = book.author;
    document.getElementById("bookIsbn").value        = book.isbn || "";
    document.getElementById("bookDescription").value = book.description || "";

    // Set current cover as preview
    const preview = document.getElementById("cover-preview");
    preview.src = book.cover || "imgs/book1.png";

    // Set genre dropdown
    const genreSelect = document.getElementById("bookGenre");
    for (let option of genreSelect.options) {
      if (option.value === book.genre) {
        option.selected = true;
        break;
      }
    }
  }
}

// Preview new cover if uploaded
document.getElementById("bookCover").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("cover-preview").src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Save changes
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title       = document.getElementById("bookTitle").value.trim();
  const author      = document.getElementById("bookAuthor").value.trim();
  const isbn        = document.getElementById("bookIsbn").value.trim();
  const genre       = document.getElementById("bookGenre").value;
  const description = document.getElementById("bookDescription").value.trim();
  const fileInput   = document.getElementById("bookCover");
  const file        = fileInput.files[0];

  if (!title || !author || !genre) {
    alert("Please fill in Title, Author, and Genre.");
    return;
  }

  const existingBook = getBookById(bookId);

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateBook({
        ...existingBook,
        title, author, isbn, genre, description,
        cover: e.target.result
      });
      alert(`"${title}" updated successfully!`);
      window.location.href = "Books-Management.html";
    };
    reader.readAsDataURL(file);
  } else {
    updateBook({
      ...existingBook,
      title, author, isbn, genre, description
    });
    alert(`"${title}" updated successfully!`);
    window.location.href = "Books-Management.html";
  }
});