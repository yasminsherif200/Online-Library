// ─── Intial seed data ─────────────────
const SEED_BOOKS = [
    { 
        id: "b1", 
        title: "Echoes of Time", 
        author: "Evelyn St. Claire", 
        isbn: "978-0-001", 
        genre: "Historical Fiction", 
        description: "A journey through memory and forgotten civilisations across three centuries.", 
        cover: "imgs/book1.png", 
        available: true 
    },
    { 
        id: "b2",
        title: "The Silent Verse", 
        author: "Marcus Vane", 
        isbn: "978-0-002", 
        genre: "Poetry", 
        description: "A poetic exploration of silence, identity and the spaces between words.", 
        cover: "imgs/book2.png", 
        available: true 
    },
    { 
        id: "b3", 
        title: "The Lost Meridian", 
        author: "Clara Osei", 
        isbn: "978-0-003", 
        genre: "Adventure", 
        description: "An adventure across uncharted lands in search of a forgotten empire.", 
        cover: "imgs/book3.png", 
        available: true 
    },
    { 
        id: "b4", 
        title: "Oceans Within", 
        author: "Sarah Waters", 
        isbn: "978-0-004", 
        genre: "Science", 
        description: "A deep dive into marine biology and the mysteries of the deep sea.", 
        cover: "imgs/book4.png", 
        available: true 
    },
    { 
        id: "b5", 
        title: "Peak Wisdom", 
        author: "Julian Frost", 
        isbn: "978-0-005", 
        genre: "Non-Fiction", 
        description: "Lessons from the world's highest mountains and the climbers who conquered them.", 
        cover: "imgs/book5.png", 
        available: true 
    },
];

const ADMIN_ACCOUNT = { email: "admin@library.com", password: "admin123", role: "admin", username: "Admin" };

// ─── run once on first load ───────────────────────────────────────────
function initStorage() {
  if (!localStorage.getItem("lib_books")) {
    localStorage.setItem("lib_books", JSON.stringify(SEED_BOOKS));
  }
  if (!localStorage.getItem("lib_users")) {
    localStorage.setItem("lib_users", JSON.stringify([ADMIN_ACCOUNT]));
  }
  if (!localStorage.getItem("lib_borrows")) {
    localStorage.setItem("lib_borrows", JSON.stringify([]));
  }
}

// ─── Books ──────────────────────────────────────────
function getBooks() {
  return JSON.parse(localStorage.getItem("lib_books")) || []; 
}
function saveBooks(books) {
    localStorage.setItem("lib_books", JSON.stringify(books)); 
}
function getBookById(id) { 
    return getBooks().find(b => b.id === id) || null; 
}

function addBook(book) {
  const books = getBooks();
  const books_existing = getBooks();
  const nextNum = books_existing.length + 1;
  book.id = "b" + String(nextNum);
  book.available = true;
  books.push(book);
  saveBooks(books);
}

function updateBook(updatedBook) {
  const books = getBooks().map(b => b.id === updatedBook.id ? updatedBook : b);
  saveBooks(books);
}

function deleteBook(id) {
  saveBooks(getBooks().filter(b => b.id !== id));
}

// ─── Users ──────────────────────
function getUsers() { 
    return JSON.parse(localStorage.getItem("lib_users")) || []; 
}
function saveUsers(users) { 
    localStorage.setItem("lib_users", JSON.stringify(users)); 
}

function registerUser(username, email, password, isAdmin) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { success: false, msg: "Email already registered." };
  users.push({ username, email, password, role: isAdmin ? "admin" : "user" });
  saveUsers(users);
  return { success: true };
}

function loginUser(email, password, expectedRole) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password && u.role === expectedRole);
  return user || null;
}

// ─── Session ────────────────────
function setSession(user) { 
    sessionStorage.setItem("lib_session", JSON.stringify(user)); 
}
function getSession() { 
    return JSON.parse(sessionStorage.getItem("lib_session")) || null; 
}
function clearSession() { 
    sessionStorage.removeItem("lib_session"); 
}
function isLoggedIn() { 
    return getSession() !== null; 
}
function isAdmin() { 
    const s = getSession(); return s && s.role === "admin"; 
}

// ─── Borrows ───────────────────────────────────
function getBorrows() { 
    return JSON.parse(localStorage.getItem("lib_borrows")) || []; 
}

function saveBorrows(borrows) { 
    localStorage.setItem("lib_borrows", JSON.stringify(borrows)); 
}

function borrowBook(bookId, userEmail) {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book || !book.available) return { success: false, msg: "Book not available." };
  book.available = false;
  saveBooks(books);
  const borrows = getBorrows();
  borrows.push({ bookId, userEmail, borrowDate: new Date().toISOString(), returnDate: null });
  saveBorrows(borrows);
  return { success: true };
}

function returnBook(bookId, userEmail) {
  const borrows = getBorrows().map(b => {
    if (b.bookId === bookId && b.userEmail === userEmail && !b.returnDate) {
      b.returnDate = new Date().toISOString();
    }
    return b;
  });
  saveBorrows(borrows);
  const books = getBooks().map(b => b.id === bookId ? { ...b, available: true } : b);
  saveBooks(books);
}

function getUserBorrows(userEmail) {
  return getBorrows().filter(b => b.userEmail === userEmail && !b.returnDate);
}

// ─── Route Gaurds ──────────────────────
function requireLogin() { if (!isLoggedIn()) { window.location.href = "login.html"; } }
function requireAdmin() { if (!isAdmin())    { window.location.href = "login.html"; } }
function requireUser()  { const s = getSession(); if (!s || s.role !== "user") window.location.href = "login.html"; }

// ─── Logout ───────────────────────────────────
function logout() { clearSession(); window.location.href = "index.html"; }

initStorage();