import { apiFetch } from "./api.js";
import { AUTH_URL } from "./constants.js";
import { renderNavbar } from "./navbar.js";

const form = document.getElementById("register-form");
const errorEl = document.getElementById("register-error");

renderNavbar();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const formData = new FormData(form);
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email.endsWith("@stud.noroff.no")) {
    errorEl.textContent = "You must use a @stud.noroff.no email address.";
    return;
  }

  try {
    await apiFetch(`${AUTH_URL}/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    window.location.href = "./login.html";
  } catch (error) {
    errorEl.textContent = error.message;
  }
});
