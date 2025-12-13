import { getUser, clearUser } from "./storage.js";

export function renderNavbar() {
  const navLinks = document.getElementById("nav-links");
  if (!navLinks) return;

  const user = getUser();

  // Detect if current page is inside /pages
  const isPages = window.location.pathname.includes("/pages/");

  const home = isPages ? "../index.html" : "./index.html";
  const login = isPages ? "./login.html" : "./pages/login.html";
  const register = isPages ? "./register.html" : "./pages/register.html";
  const profile = isPages ? "./profile.html" : "./pages/profile.html";
  const createListing = isPages
    ? "./create-listing.html"
    : "./pages/create-listing.html";

  // Logged out navbar
  if (!user) {
    navLinks.innerHTML = `
      <a href="${login}">Log in</a>
      <a href="${register}" class="btn-outline">Sign up</a>
    `;
    return;
  }

  // Logged in navbar
  navLinks.innerHTML = `
    <span class="credits">Credits: ${user.credits ?? 0}</span>
    <a href="${createListing}">Create listing</a>
    <a href="${profile}">Profile</a>
    <button id="logout-btn" class="btn-link">Log out</button>
  `;

  document
    .getElementById("logout-btn")
    .addEventListener("click", () => {
      clearUser();
      window.location.href = home;
    });
}
