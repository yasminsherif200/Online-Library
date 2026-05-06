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
    margin-bottom: 6px;
    display: block;
  `;
  input.insertAdjacentElement("afterend", msg);
}

function clearError(input) {
  input.style.border = "2px #f5f5fa solid";
  const existing = input.nextElementSibling;
  if (existing?.classList.contains("js-error-msg")) existing.remove();
}

["email", "password"].forEach((id) => {
  document.getElementById(id).addEventListener("input", (e) => clearError(e.target));
});


// Form validation before submit
function validateLogin() {
  const email    = document.getElementById("email");
  const password = document.getElementById("password");
  let valid      = true;

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

  return valid;
}


// Attach validation to both buttons
document.querySelector(".user-btn").addEventListener("click", (e) => {
  e.preventDefault();
  if (validateLogin()) handleLogin("user");
});

document.querySelector(".admin-btn").addEventListener("click", (e) => {
  e.preventDefault();
  if (validateLogin()) handleLogin("admin");
});

// Handling Local Storage
function handleLogin(role) {
  const email    = document.getElementById("email");
  const password = document.getElementById("password");

  const user = loginUser(email.value.trim(), password.value, role);

  if (!user) {
    if (role === "admin") {
      showError(email, "No admin account found with these credentials.");
    } else {
      showError(email, "Invalid email or password.");
    }
    return;
  }

  // Save session
  setSession(user);

  // Redirect
  if (user.role === "admin") {
    window.location.href = "AdminDashboard.html";
  } else {
    window.location.href = "User-Dashboard.html";
  }
}