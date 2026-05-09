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

// Preview image when selected
document.getElementById("book_cover").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById("cover-preview");
    preview.src = e.target.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// Add book form
document.getElementById("add-book-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title       = document.getElementById("book_title").value.trim();
  const author      = document.getElementById("book_author").value.trim();
  const isbn        = document.getElementById("book_isbn").value.trim();
  const genre       = document.getElementById("book_genre").value;
  const description = document.getElementById("book_description").value.trim();
  const fileInput   = document.getElementById("book_cover");
  const file        = fileInput.files[0];

  if (!title || !author || !genre) {
    alert("Please fill in Title, Author, and Genre.");
    return;
  }

  // If a cover image was selected, convert to base64 then POST
  if (file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      await submitAddBook({ title, author, isbn, genre, description, cover: e.target.result });
    };
    reader.readAsDataURL(file);
  } else {
    await submitAddBook({ title, author, isbn, genre, description, cover: "imgs/book1.png" });
  }
});

async function submitAddBook(bookData) {
  try {
    const response = await fetch(`${API_BASE}/api/books/add/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) throw new Error("Failed to add book");

    alert(`"${bookData.title}" has been added to the archive!`);
    window.location.href = "/books-management/";
  } catch (error) {
    console.error("Error adding book:", error);
    alert("Failed to add book. Please try again.");
  }
}
