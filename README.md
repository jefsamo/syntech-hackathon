# 🥗 Food Expiry Tracker — Frontend

A user-facing web application that helps individuals track food expiry dates, reduce food waste, and build sustainable habits through an intuitive, camera-driven workflow.

This frontend was built as part of a hackathon project and focuses on **simplicity**, **speed**, and **real-world usability**, guiding users step-by-step from scanning a product to safely storing expiry information.

🏆 **Achievement:** First Runner-Up at the hackathon.

---

## Application Overview

The frontend provides a simple dashboard where users can:

- Scan packaged food products
- Add cooked food manually
- View their tracked items
- Check the leaderboard
- Manage basic settings

The core user journey centres around **“Scan a Product”**, which combines barcode scanning and image capture to minimise manual data entry.

---

## Dashboard UI

Upon login, users are greeted with a dashboard offering clear actions:

- **Scan a product**
- **View my items**
- **Leaderboard**
- **Add cooked food**
- **Settings**
- **Change user**

The layout is intentionally minimal to reduce friction and guide first-time users.

---

## Scan a Product — Workflow

The “Scan a Product” feature follows a structured, user-friendly flow:

### 1. Start Scan
- User clicks **“Scan a product”** from the dashboard
- The app navigates to the scanning page

---

### 2. Camera Permission
- The browser requests access to the user’s camera
- Camera access is required for barcode scanning and image capture

---

### 3. Barcode Scanning
- User scans the product’s barcode using their camera
- The barcode is captured and stored temporarily
- This step uniquely identifies the product

---

### 4. Expiry Date Capture
- After a successful barcode scan, the user is prompted to:
  - Take a **photo of the expiry date** on the product label
- This image is later processed by the backend AI service to extract the expiry date

---

### 5. Item Confirmation & Storage
- Once the image is captured:
  - The barcode
  - Expiry image
  - User identity  
  are submitted to the backend
- The item is saved to the user’s account
- The user is redirected back to their dashboard or item list

---

## Outcome

After completing the workflow:
- The item appears in the user’s tracked items
- Expiry dates are stored and can be monitored
- Users build an accurate record of their food inventory without manual typing

---

## Design Goals

- **Low friction**: minimal typing, camera-first experience
- **Accessibility**: familiar browser-based camera permissions
- **Speed**: complete scan flow in under a minute
- **Accuracy**: AI-assisted expiry extraction
- **Sustainability**: encourage conscious food usage

---

## Tech Stack (Frontend)

- React
- Mantine UI
- TypeScript
- Tanstack query for remote state synchronization

---

## Why This Matters

Food waste is often caused by poor visibility and forgetfulness. By combining barcode scanning, image capture, and automation, this frontend reduces cognitive load and makes food tracking fast, practical, and accessible for everyday users.
