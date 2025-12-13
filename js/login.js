import { apiFetch } from "./api.js";
import { AUTH_URL, API_KEY } from "./constants.js";
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
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    // 🔒 Store ONLY what we need
    saveUser({
      name: result.data.name,
      email: result.data.email,
      credits: result.data.credits,
      accessToken: result.data.accessToken,
      avatar: result.data.avatar ?? null,
      banner: result.data.banner ?? null,
    });

    window.location.href = "../index.html";
  } catch (error) {
    errorEl.textContent = error.message;
  }
});
