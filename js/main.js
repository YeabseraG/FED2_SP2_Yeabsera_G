import { loadListings } from "./listings.js";
import { renderNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  loadListings();
});
