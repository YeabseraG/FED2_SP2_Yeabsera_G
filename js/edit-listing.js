import { renderNavbar } from "./navbar.js";
import { getUser } from "./storage.js";
import { apiFetch } from "./api.js";
import { AUCTION_LISTINGS_URL, API_KEY } from "./constants.js";
import { getMediaUrl } from "./utils.js";

const form = document.getElementById("edit-listing-form");
const message = document.getElementById("message");

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

document.addEventListener("DOMContentLoaded", async () => {
  renderNavbar();

  const user = getUser();
  if (!user || !listingId) {
    window.location.href = "../index.html";
    return;
  }

  await loadListing();

  form.addEventListener("submit", onSaveChanges);
});

async function loadListing() {
  try {
    const result = await apiFetch(
      `${AUCTION_LISTINGS_URL}/${listingId}?_seller=true`
    );

    const listing = result.data;
    const user = getUser();


    if (listing.seller?.name !== user.name) {
      alert("You can only edit your own listings.");
      window.location.href = "../index.html";
      return;
    }

    document.getElementById("title").value = listing.title;
    document.getElementById("description").value = listing.description || "";
    document.getElementById("image").value =
      listing.media?.[0]?.url || "";
    document.getElementById("endsAt").value =
      listing.endsAt.slice(0, 16);
  } catch (error) {
    message.textContent = error.message;
  }
}

async function onSaveChanges(e) {
  e.preventDefault();
  message.textContent = "";

  const user = getUser();

  const payload = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    endsAt: new Date(
      document.getElementById("endsAt").value
    ).toISOString(),
    media: document.getElementById("image").value
      ? [
          {
            url: document.getElementById("image").value.trim(),
            alt: document.getElementById("title").value.trim(),
          },
        ]
      : [],
  };

  try {
    message.textContent = "Saving changes...";

    await apiFetch(`${AUCTION_LISTINGS_URL}/${listingId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "X-Noroff-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    message.textContent = "Saved!";
    window.location.href = `./listing.html?id=${listingId}`;
  } catch (error) {
    message.textContent = error.message;
  }
}
