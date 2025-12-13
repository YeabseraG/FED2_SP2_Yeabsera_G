import { renderNavbar } from "./navbar.js";
import { getUser, saveUser } from "./storage.js";
import { apiFetch } from "./api.js";
import {
  AUCTION_PROFILES_URL,
  AUCTION_LISTINGS_URL,
  API_KEY
} from "./constants.js";
import { getMediaUrl } from "./utils.js";

const elName = document.getElementById("profile-name");
const elCreditsLarge = document.getElementById("profile-credits-large");
const elBio = document.getElementById("bio");
const elAvatar = document.getElementById("avatar");
const elBanner = document.getElementById("banner");
const elAvatarImg = document.getElementById("profile-avatar-img");
const elBannerImg = document.getElementById("profile-banner-img");
const elMessage = document.getElementById("profile-message");

const userListings = document.getElementById("user-listings");
const userBids = document.getElementById("user-bids");
const form = document.getElementById("profile-form");

const editProfileBtn = document.getElementById("edit-profile-btn");
const editSection = document.getElementById("edit-profile-section");
const elProfileBio = document.getElementById("profile-bio");


document.addEventListener("DOMContentLoaded", async () => {
  renderNavbar();

  const user = getUser();
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  // 🔒 Hide edit section by default
  editSection.classList.add("hidden");

  await loadProfile();
  await loadUserActivity();

  form.addEventListener("submit", onSaveProfile);

  editProfileBtn.addEventListener("click", () => {
    editSection.classList.toggle("hidden");
  });
});

async function loadProfile() {
  const user = getUser();
  elMessage.textContent = "";

  try {
    const result = await apiFetch(
      `${AUCTION_PROFILES_URL}/${user.name}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "X-Noroff-API-Key": API_KEY,
        },
      }
      
    );

    const profile = result.data;

    if (elCreditsLarge) {
  elCreditsLarge.textContent = `Credits: ${profile.credits ?? 0}`;
}


    if (elProfileBio) {
  elProfileBio.textContent = profile.bio || "No bio provided.";
}


    elName.textContent = profile.name;
    elBio.value = profile.bio ?? "";

    const avatarUrl = getImageUrl(profile.avatar);
    const bannerUrl = getImageUrl(profile.banner);

    elAvatar.value = avatarUrl;
    elBanner.value = bannerUrl;

    setImage(elAvatarImg, avatarUrl);
    setImage(elBannerImg, bannerUrl);

    saveUser({
  ...user,
  credits: profile.credits,
  avatar: profile.avatar ?? null,
  banner: profile.banner ?? null,
});


    renderNavbar();
  } catch (error) {
    elMessage.textContent = `Failed to load profile: ${error.message}`;
  }
}

async function onSaveProfile(e) {
  e.preventDefault();
  elMessage.textContent = "";

  const user = getUser();

  const avatarUrl = elAvatar.value.trim();
  const bannerUrl = elBanner.value.trim();

  const payload = {
  bio: elBio.value.trim(),

  avatar: avatarUrl
    ? { url: avatarUrl, alt: "User avatar" }
    : null,

  banner: bannerUrl
    ? { url: bannerUrl, alt: "Profile banner" }
    : null,
};


  try {
    elMessage.textContent = "Saving...";

    const result = await apiFetch(
      `${AUCTION_PROFILES_URL}/${user.name}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "X-Noroff-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const updated = result.data;

    elMessage.textContent = "Saved!";
    setImage(elAvatarImg, getImageUrl(updated.avatar));
    setImage(elBannerImg, getImageUrl(updated.banner));

    saveUser({
      ...user,
      credits: updated.credits ?? user.credits,
      avatar: updated.avatar,
      banner: updated.banner,
    });

    renderNavbar();

    // ✅ Hide edit form after save
    editSection.classList.add("hidden");
  } catch (error) {
    elMessage.textContent = error.message;
  }
}

async function loadUserActivity() {
  const user = getUser();

  try {
    const result = await apiFetch(
      `${AUCTION_LISTINGS_URL}?_seller=true&_bids=true&limit=100&sort=created`,
      {
        headers: {
          "X-Noroff-API-Key": API_KEY,
        },
      }
    );

    const listings = result.data || [];

    const created = listings.filter((l) => l.seller?.name === user.name);
    const bidOn = listings.filter(
      (l) => Array.isArray(l.bids) && l.bids.some((b) => b.bidder?.name === user.name)
    );

    renderListingGrid(
  userListings,
  created,
  "You haven’t created any listings yet.",
  true // can edit
);

renderListingGrid(
  userBids,
  bidOn,
  "You haven’t bid on any listings yet.",
  false // cannot edit
);

  } catch (error) {
    userListings.innerHTML = `<p>Failed to load your listings: ${error.message}</p>`;
    userBids.innerHTML = `<p>Failed to load bid activity: ${error.message}</p>`;
  }
}

function renderListingGrid(container, listings, emptyText, canEdit = false) {
  if (!listings.length) {
    container.innerHTML = `<p>${emptyText}</p>`;
    return;
  }

  container.innerHTML = "";

  listings.forEach((listing) => {
    const image = getMediaUrl(listing.media);
    const bidsCount = listing._count?.bids ?? (listing.bids?.length ?? 0);

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

    ${canEdit ? `
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    ` : ""}
  </div>
`;


    if (canEdit) {
  const editBtn = card.querySelector(".edit-btn");
  const deleteBtn = card.querySelector(".delete-btn");

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.location.href = `./edit-listing.html?id=${listing.id}`;
  });

  deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this listing?")) return;
    await deleteListing(listing.id);
    await loadUserActivity();
  });
}


    card.addEventListener("click", () => {
      window.location.href = `./listing.html?id=${listing.id}`;
    });

    container.appendChild(card);
  });
}

function getHighestBid(listing) {
  if (!Array.isArray(listing.bids) || listing.bids.length === 0) return "No bids";
  return Math.max(...listing.bids.map((b) => b.amount));
}

function setImage(imgEl, url) {
  if (!url) {
    imgEl.style.display = "none";
    return;
  }
  imgEl.src = url;
  imgEl.style.display = "block";
  imgEl.onerror = () => (imgEl.style.display = "none");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[m];
  });
}

function getImageUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.url) return value.url;
  return "";
}

async function deleteListing(listingId) {
  const user = getUser();
  await apiFetch(`${AUCTION_LISTINGS_URL}/${listingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });
}
