import { apiFetch } from "./api.js";
import { AUTH_URL } from "./constants.js";
import { saveUser } from "./storage.js";
import { renderNavbar } from "./navbar.js";

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");

renderNavbar();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const formData = new FormData(form);
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const result = await apiFetch(`${AUTH_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    saveUser({
      name: result.data.name,
      credits: result.data.credits,
      accessToken: result.data.accessToken,
    });

    window.location.href = "../index.html";
  } catch (error) {
    errorEl.textContent = error.message;
  }
});
