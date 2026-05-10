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

if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");
        sidebarToggle.classList.toggle("active");
    });
}

if (overlay) {
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        sidebarToggle.classList.remove("active");
    });
}

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

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");
const form = document.getElementById("editBookForm");
const notFound = document.getElementById("not-found-msg");

async function loadBook() {
  if (!bookId) {
    notFound.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(`/api/books/${encodeURIComponent(bookId)}/`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Book not found");


    form.classList.remove("hidden");
    document.getElementById("bookID").value = book.id;
    document.getElementById("bookTitle").value = book.title;
    document.getElementById("bookAuthor").value = book.author;
    document.getElementById("bookIsbn").value = book.isbn || "";
    document.getElementById("bookDescription").value = book.description || "";

    const preview = document.getElementById("cover-preview");
    preview.src = book.cover || "";

    const genreSelect = document.getElementById("bookGenre");
    for (let option of genreSelect.options) {
      if (option.value === book.genre || option.textContent === book.genre) {
        option.selected = true;
        break;
      }
    }
  } catch (error) {
    console.error("Error loading book:", error);
    notFound.classList.remove("hidden");
  }
}

document.getElementById("bookCover").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("cover-preview").src = e.target.result;
  };
  reader.readAsDataURL(file);
});

async function submitUpdateBook(updatedData) {
  try {
    const response = await fetch(
      `/api/books/${encodeURIComponent(bookId)}/update/`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify(updatedData),
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to update book");
    }

    alert(`"${updatedData.title}" updated successfully!`);
    window.location.href = "/Books-Management/";
  } catch (error) {
    console.error("Error updating book:", error);
    alert(error.message || "Failed to update book. Please try again.");
  }
}

(async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  await loadBook();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const isbn = document.getElementById("bookIsbn").value.trim();
    const genre = document.getElementById("bookGenre").value;
    const description = document.getElementById("bookDescription").value.trim();
    const fileInput = document.getElementById("bookCover");
    const file = fileInput.files[0];

    if (!title || !author || !genre) {
      alert("Please fill in Title, Author, and Genre.");
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await submitUpdateBook({
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
      await submitUpdateBook({ title, author, isbn, genre, description });
    }
  });
})();
