// Nav shadow on scroll 
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  nav.style.boxShadow = window.scrollY > 10 ? "0 2px 12px rgba(0,0,0,0.08)" : "none";
  nav.style.transition = "box-shadow 0.3s ease";
});

//  Active nav link 
document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.href === window.location.href) {
    link.style.color = "#0F172A";
    link.style.borderBottom = "3px #0F172A solid";
  }
});

//  show / clear error helpers 
function showError(input, message) {
  clearError(input);
  input.style.border = "2px #C0392B solid";

  const msg = document.createElement("span");
  msg.className   = "js-error-msg";
  msg.textContent = message;
  msg.style.cssText = `
    color: #C0392B;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    margin-top: -6px;
    margin-bottom: 4px;
    display: block;
  `;
  input.insertAdjacentElement("afterend", msg);
}

function clearError(input) {
  input.style.border = "2px #f5f5fa solid";
  const existing = input.nextElementSibling;
  if (existing?.classList.contains("js-error-msg")) existing.remove();
}

["username", "email", "password", "confirm-pass"].forEach((id) => {
  document.getElementById(id).addEventListener("input", (e) => clearError(e.target));
});

// Password strength indicator 
const passwordInput  = document.getElementById("password");
const passwordField  = passwordInput.closest(".field");

const strengthBar = document.createElement("div");
strengthBar.style.cssText = `
  height: 4px;
  border-radius: 2px;
  margin-top: -8px;
  margin-bottom: 8px;
  width: 0%;
  transition: width 0.3s ease, background-color 0.3s ease;
`;

const strengthLabel = document.createElement("span");
strengthLabel.style.cssText = `
  font-family: "Manrope", sans-serif;
  font-size: 10px;
  color: #888;
  display: block;
  margin-bottom: 6px;
`;

passwordField.appendChild(strengthBar);
passwordField.appendChild(strengthLabel);

passwordInput.addEventListener("input", () => {
  const val      = passwordInput.value;
  let score      = 0;

  if (val.length >= 8)            score++;
  if (/[A-Z]/.test(val))          score++;
  if (/[0-9]/.test(val))          score++;
  if (/[^A-Za-z0-9]/.test(val))   score++;

  const levels = [
    { label: "",        color: "transparent", width: "0%" },
    { label: "Weak",    color: "#C0392B",     width: "33%" },
    { label: "Fair",    color: "#E67E22",     width: "66%" },
    { label: "Strong",  color: "#27AE60",     width: "100%" },
  ];

  const level = val.length === 0 ? levels[0] : score <= 1 ? levels[1] : score <= 2 ? levels[2] : levels[3];

  strengthBar.style.width           = level.width;
  strengthBar.style.backgroundColor = level.color;
  strengthLabel.textContent         = val.length > 0 ? `Password strength: ${level.label}` : "";
  strengthLabel.style.color         = level.color;
});

//  Form validation 
function validateSignup() {
  const username    = document.getElementById("username");
  const email       = document.getElementById("email");
  const password    = document.getElementById("password");
  const confirmPass = document.getElementById("confirm-pass");
  let valid         = true;

  if (!username.value.trim()) {
    showError(username, "Username is required.");
    valid = false;
  } else if (username.value.trim().length < 3) {
    showError(username, "Username must be at least 3 characters.");
    valid = false;
  }

  if (!email.value.trim()) {
    showError(email, "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showError(email, "Please enter a valid email address.");
    valid = false;
  }

  if (!password.value.trim()) {
    showError(password, "Password is required.");
    valid = false;
  } else if (password.value.length < 6) {
    showError(password, "Password must be at least 6 characters.");
    valid = false;
  }

  if (!confirmPass.value.trim()) {
    showError(confirmPass, "Please confirm your password.");
    valid = false;
  } else if (confirmPass.value !== password.value) {
    showError(confirmPass, "Passwords do not match.");
    valid = false;
  }

  return valid;
}

// Handling Local Storage
document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (!validateSignup()) return;

  const username = document.getElementById("username").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const isAdmin  = document.getElementById("checkbox").checked;

  const result = registerUser(username, email, password, isAdmin);

  if (!result.success) {
    alert(result.msg); // "Email already registered."
    return;
  }

  // Log them in immediately after registration
  const user = { username, email, role: isAdmin ? "admin" : "user" };
  setSession(user);

  alert("Registered successfully!");

  if (isAdmin) {
    window.location.href = "AdminDashboard.html";
  } else {
    window.location.href = "User-Dashboard.html";
  }
});