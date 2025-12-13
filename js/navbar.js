import { getUser, clearUser } from "./storage.js";

export function renderNavbar() {
  const navLinks = document.getElementById("nav-links");
  if (!navLinks) return;

  const user = getUser();

  const isPages = window.location.pathname.includes("/pages/");

  const home = isPages ? "../index.html" : "./index.html";
  const login = isPages ? "./login.html" : "./pages/login.html";
  const register = isPages ? "./register.html" : "./pages/register.html";
  const profile = isPages ? "./profile.html" : "./pages/profile.html";
  const createListing = isPages
    ? "./create-listing.html"
    : "./pages/create-listing.html";

  // LOGGED OUT
  if (!user) {
    navLinks.innerHTML = `
      <a href="${login}">Log in</a>
      <a href="${register}" class="btn-outline">Sign up</a>
    `;
    return;
  }

  // Avatar fallback handling (string OR object OR empty)
  const avatarUrl =
    user.avatar?.url ||
    user.avatar ||
    "https://via.placeholder.com/40";

  // LOGGED IN
  navLinks.innerHTML = `
    <span class="credits">Credits: ${user.credits ?? 0}</span>

    <a href="${createListing}">Create listing</a>

    <button id="logout-btn" class="btn-link">Log out</button>

    <a href="${profile}" class="nav-avatar" title="Profile">
      <img src="${avatarUrl}" alt="Profile avatar" />
    </a>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearUser();
    window.location.href = home;
  });
}
