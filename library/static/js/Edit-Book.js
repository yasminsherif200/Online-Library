requireAdmin();

const API_BASE = "http://127.0.0.1:8000";

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
const params  = new URLSearchParams(window.location.search);
const bookId  = params.get("id");
const form    = document.getElementById("editBookForm");
const notFound = document.getElementById("not-found-msg");

// Load book data from API
async function loadBook() {
  if (!bookId) {
    notFound.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/books/${bookId}/`);
    if (!response.ok) throw new Error("Book not found");

    const book = await response.json();

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

  } catch (error) {
    console.error("Error loading book:", error);
    notFound.classList.remove("hidden");
  }
}

loadBook();

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
form.addEventListener("submit", async (e) => {
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

  // If a new cover was uploaded, convert to base64 then PUT
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      await submitUpdateBook({ title, author, isbn, genre, description, cover: e.target.result });
    };
    reader.readAsDataURL(file);
  } else {
    await submitUpdateBook({ title, author, isbn, genre, description });
  }
});

async function submitUpdateBook(updatedData) {
  try {
    const response = await fetch(`${API_BASE}/api/books/${bookId}/update/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Failed to update book");

    alert(`"${updatedData.title}" updated successfully!`);
    window.location.href = "/books-management/";
  } catch (error) {
    console.error("Error updating book:", error);
    alert("Failed to update book. Please try again.");
  }
}
