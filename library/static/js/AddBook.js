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
document.getElementById("add-book-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("book_title").value.trim();
  const author = document.getElementById("book_author").value.trim();
  const isbn = document.getElementById("book_isbn").value.trim();
  const genre = document.getElementById("book_genre").value;
  const description = document.getElementById("book_description").value.trim();
  const fileInput = document.getElementById("book_cover");
  const file = fileInput.files[0];

  if (!title || !author || !genre) {
    alert("Please fill in Title, Author, and Genre.");
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      addBook({ title, author, isbn, genre, description, cover: e.target.result });
      alert(`"${title}" has been added to the archive!`);
      window.location.href = "Books-Management.html";
    };
    reader.readAsDataURL(file);
  } else {
    addBook({ title, author, isbn, genre, description, cover: "imgs/book1.png" });
    alert(`"${title}" has been added to the archive!`);
    window.location.href = "Books-Management.html";
  }
});