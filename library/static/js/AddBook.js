function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function requireAdmin() {
  try {
    const res = await fetch("/api/auth/me/", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "/login/";
      return false;
    }
    const data = await res.json();
    if (!data || data.role !== "admin") {
      window.location.href = "/login/";
      return false;
    }
    return true;
  } catch {
    window.location.href = "/login/";
    return false;
  }
}

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

document.getElementById("logout-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
  } catch (err) {
    console.error(err);
  }
  window.location.href = "/";
});

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

async function submitAddBook(bookData) {
  try {
    const response = await fetch("/api/books/add/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
      body: JSON.stringify(bookData),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to add book");
    }

    alert(`"${bookData.title}" has been added to the archive!`);
    window.location.href = "/Books-Management/";
  } catch (error) {
    console.error("Error adding book:", error);
    alert(error.message || "Failed to add book. Please try again.");
  }
}

(async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  document.getElementById("add-book-form").addEventListener("submit", async (e) => {
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
      reader.onload = async function (ev) {
        await submitAddBook({
          title,
          author,
          isbn,
          genre,
          description,
          cover: ev.target.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      await submitAddBook({
        title,
        author,
        isbn,
        genre,
        description,
        cover: "",
      });
    }
  });
})();
