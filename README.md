# AuctionHouse – Frontend Auction Platform

## 📖 Project Overview

AuctionHouse is a front-end auction platform built using **HTML, CSS, and vanilla JavaScript**, developed as part of the Noroff Front-End Development assignment.  
The application allows users to browse auction listings, register and log in with a Noroff student email, create and manage listings, place bids, and manage their user profile.

The project focuses on **clean structure, API integration, authentication, and responsive UI**, without the use of front-end frameworks.

---


### Public Users
- Browse auction listings
- View individual listings with bid history

### Registered Users
- Register & log in (restricted to `@stud.noroff.no`)
- Always-visible credit balance when logged in
- Create, edit, and delete listings
- Place bids on other users’ listings
- View listings created by the user
- View listings the user has bid on
- Edit profile (bio, avatar, banner)

### UI & UX
- Responsive design (desktop & mobile)
- Clean, dark-themed interface
- Profile dashboard with activity overview
- Mobile-optimized profile and listing pages

---

## 🛠 Tech Stack

- HTML5  
- CSS3  
- Vanilla JavaScript (ES Modules)  
- Noroff API v2  
- GitHub Pages (deployment)

> No front-end frameworks were used, in accordance with the assignment requirements.

---

## 🔌 API Usage

This project uses the **Noroff API v2**:

- Authentication API (`/auth`)
- Auction Listings API (`/auction/listings`)
- Profiles API (`/auction/profiles`)

All authenticated requests include:
- `Authorization: Bearer <accessToken>`
- `X-Noroff-API-Key`

---

## 🧪 Testing & Code Quality

### ESLint
ESLint is used to ensure clean and consistent JavaScript.

#### Run linting:
```bash
npm run lint
