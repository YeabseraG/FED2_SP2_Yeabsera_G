import { AUCTION_LISTINGS_URL } from "./constants.js";
import { apiFetch } from "./api.js";
import { getMediaUrl } from "./utils.js";

const listingsGrid = document.getElementById("listings-grid");

export async function loadListings() {
  try {
    showLoading();

    const result = await apiFetch(
      `${AUCTION_LISTINGS_URL}?limit=12&sort=created`
    );

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
    const timeLabel = getAuctionTimeLabel(listing.endsAt);

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card-image">
        <img
          src="${image}"
          alt="${escapeHtml(listing.title)}"
          onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=No+Image';"
        />
      </div>

      <div class="card-body">
        <h3>${escapeHtml(listing.title)}</h3>
        <p class="meta">${bidsCount} bids · ${timeLabel}</p>
        <p class="price">${getHighestBidText(listing)}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `./pages/listing.html?id=${listing.id}`;
    });

    listingsGrid.appendChild(card);
  });
}

function getAuctionTimeLabel(endsAtValue) {
  const endsAt = new Date(endsAtValue);
  const now = new Date();
  const msLeft = endsAt - now;

  if (msLeft <= 0) {
    return "Auction ended";
  }

  const totalMinutes = Math.floor(msLeft / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `Ends in ${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `Ends in ${hours}h ${minutes}m`;
  }

  return `Ends in ${minutes}m`;
}

function getHighestBidText(listing) {
  if (!Array.isArray(listing.bids) || listing.bids.length === 0) {
    return "Click to join Auction";
  }

  const highest = Math.max(...listing.bids.map((b) => b.amount));
  return `Highest bid: ${highest} EUR`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[m];
  });
}