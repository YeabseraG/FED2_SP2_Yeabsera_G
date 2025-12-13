import { AUCTION_LISTINGS_URL } from "./constants.js";
import { apiFetch } from "./api.js";
import { getMediaUrl } from "./utils.js"; // or wherever you put it

const listingsGrid = document.getElementById("listings-grid");

export async function loadListings() {
  try {
    showLoading();

    // Note: If your API supports sort/limit differently, we can adjust quickly.
    const result = await apiFetch(`${AUCTION_LISTINGS_URL}?limit=12&sort=created`);

    renderListings(result.data);
  } catch (error) {
    showError(error.message);
  }
}

function showLoading() {
  listingsGrid.innerHTML = `<p>Loading listings...</p>`;
}

function showError(message) {
  listingsGrid.innerHTML = `<p>Failed to load listings: ${message}</p>`;
}

function renderListings(listings) {
  listingsGrid.innerHTML = "";

  listings.forEach((listing) => {
    const image = getMediaUrl(listing.media);

    const bidsCount = listing._count?.bids ?? 0;

    const endsAt = new Date(listing.endsAt);
    const now = new Date();
    const msLeft = Math.max(0, endsAt - now);
    const hours = Math.floor(msLeft / (1000 * 60 * 60));
    const minutes = Math.floor((msLeft / (1000 * 60)) % 60);

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card-image">
        <img src="${image}" alt="${escapeHtml(listing.title)}" />
      </div>

      <div class="card-body">
        <h3>${escapeHtml(listing.title)}</h3>
        <p class="meta">${bidsCount} bids · ${hours}h ${minutes}m</p>
        <p class="price">${getHighestBid(listing)} EUR</p>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `./pages/listing.html?id=${listing.id}`;
    });

    listingsGrid.appendChild(card);
  });
}

// Utilities (kept local for clarity)
function getHighestBid(listing) {
  if (!Array.isArray(listing.bids) || listing.bids.length === 0) return "No bids";
  return Math.max(...listing.bids.map((b) => b.amount));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[m];
  });
}
