import { getUser, saveUser } from "./storage.js";
import { renderNavbar } from "./navbar.js";
import {
  AUCTION_LISTINGS_URL,
  AUCTION_PROFILES_URL,
  API_KEY
} from "./constants.js";
import { apiFetch } from "./api.js";
import { getMediaUrl } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
});

const container = document.getElementById("listing-container");
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

if (!listingId) {
  container.innerHTML = "<p>Listing not found.</p>";
} else {
  loadListing();
}

async function loadListing() {
  try {
    container.innerHTML = "<p>Loading listing...</p>";

    const result = await apiFetch(
      `${AUCTION_LISTINGS_URL}/${listingId}?_bids=true&_seller=true`
    );

    renderListing(result.data);
    setupBidding(result.data);
  } catch (error) {
    container.innerHTML = `<p>Error loading listing: ${error.message}</p>`;
  }
}

function renderListing(listing) {
  const image = getMediaUrl(listing.media);
  const bids = listing.bids || [];

  const highestBid = bids.length
    ? Math.max(...bids.map((b) => b.amount))
    : "No bids";

  const endsAt = new Date(listing.endsAt).toLocaleString();

  container.innerHTML = `
    <section class="listing-layout">
      <div class="listing-image">
        <img src="${image}" alt="${listing.title}" />
      </div>

      <div class="listing-info">
        <h1>${listing.title}</h1>

        <p class="price">
          Highest bid: <strong>${highestBid} EUR</strong>
        </p>

        <p class="meta">
          Ends at: ${endsAt}
        </p>

        <p class="description">
          ${listing.description || "No description provided."}
        </p>

        <div class="bid-box">
          <input
            type="number"
            id="bid-amount"
            placeholder="Enter bid amount"
            min="1"
          />
          <button id="bid-button">Place bid</button>
          <p class="hint" id="bid-hint"></p>
        </div>
      </div>
    </section>

    <section class="bid-history">
      <h2>Bid history</h2>
      ${renderBids(bids)}
    </section>
  `;
}

function renderBids(bids) {
  if (!bids.length) {
    return "<p>No bids yet.</p>";
  }

  return `
    <ul class="bids">
      ${bids
        .sort((a, b) => b.amount - a.amount)
        .map(
          (bid) => `
          <li>
            <span>${bid.bidder?.name || "Unknown bidder"}</span>
            <strong>${bid.amount} EUR</strong>
          </li>
        `
        )
        .join("")}
    </ul>
  `;
}



function setupBidding(listing) {
  const user = getUser();

  const input = document.getElementById("bid-amount");
  const button = document.getElementById("bid-button");
  const hint = document.getElementById("bid-hint");

  if (!user) {
    hint.textContent = "Log in to place a bid.";
    button.disabled = true;
    input.disabled = true;
    return;
  }

  if (listing.seller?.name === user.name) {
    hint.textContent = "You cannot bid on your own listing.";
    button.disabled = true;
    input.disabled = true;
    return;
  }


  button.disabled = false;
  input.disabled = false;
  hint.textContent = "";

  button.onclick = () => {
    placeBid(listing.id, input.value);
  };
}


async function placeBid(listingId, amount) {
  const user = getUser();
  const hint = document.getElementById("bid-hint");

  const bidAmount = Number(amount);

  if (!bidAmount || bidAmount <= 0) {
    hint.textContent = "Enter a valid bid amount.";
    return;
  }

  try {
    hint.textContent = "Placing bid...";

    await apiFetch(`${AUCTION_LISTINGS_URL}/${listingId}/bids`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${user.accessToken}`,
    "X-Noroff-API-Key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: bidAmount,
  }),
});




    await refreshUserCredits();
    await loadListing();
  } catch (error) {
    hint.textContent = error.message;
  }
}

async function refreshUserCredits() {
  const user = getUser();
  if (!user) return;

  const result = await apiFetch(
    `${AUCTION_PROFILES_URL}/${user.name}`,
    {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "X-Noroff-API-Key": API_KEY,
      },
    }
  );

  saveUser({
    ...user,
    credits: result.data.credits,
  });

  renderNavbar();
}
