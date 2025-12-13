import { renderNavbar } from "./navbar.js";
import { getUser } from "./storage.js";
import { apiFetch } from "./api.js";
import { AUCTION_LISTINGS_URL, API_KEY } from "./constants.js";

const form = document.getElementById("create-listing-form");
const message = document.getElementById("message");

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();

  const user = getUser();
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  form.addEventListener("submit", onCreateListing);
});

async function onCreateListing(e) {
  e.preventDefault();
  message.textContent = "";

  const user = getUser();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const imageUrl = document.getElementById("image").value.trim();
  const endsAt = document.getElementById("endsAt").value;

  if (!title || !endsAt) {
    message.textContent = "Title and end date are required.";
    return;
  }

  const payload = {
  title,
  description,
  endsAt: new Date(endsAt).toISOString(),
  media: imageUrl
    ? [{ url: imageUrl, alt: title }]
    : [],
};


  try {
    message.textContent = "Creating listing...";

    const result = await apiFetch(AUCTION_LISTINGS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "X-Noroff-API-Key": API_KEY,
        "Content-Type": "application/json",
        },
      body: JSON.stringify(payload),
    });

    message.textContent = "Listing created!";
    window.location.href = `./listing.html?id=${result.data.id}`;
  } catch (error) {
    message.textContent = error.message;
  }
}
