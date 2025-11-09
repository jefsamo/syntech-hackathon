import { BASE_URL } from "../utils/expiryParser";
import type { CookedExpiryResponse } from "./cooked";

// src/api/items.ts
export type SaveItemPayload = {
  username: string;
  barcode: string;
  name?: string | null;
  brand?: string | null;
  quantity?: string | null;
  imageUrl?: string | null;
  categories?: string | null;
  nutriScore?: string | null;
  expiry: string;
  expiryRaw?: string | null;
};

// const BASE_URL = "https://syntech-hackathon-backend.onrender.com/api";

export async function saveItem(payload: SaveItemPayload) {
  const res = await fetch(`${BASE_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save item (${res.status})`);
  }

  return res.json(); // { success: true, itemId: ... }
}

export async function fetchLeaderboard(limit = 10) {
  const res = await fetch(`${BASE_URL}/items/leaderboard?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard (${res.status})`);
  }
  return res.json() as Promise<{
    entries: { username: string; itemCount: number }[];
  }>;
}

export async function saveCookedItem(
  username: string,
  cooked: CookedExpiryResponse
) {
  const barcode = "COOKED-" + Date.now();

  await saveItem({
    username,
    barcode,
    name: cooked.food_name ?? "Cooked meal",
    brand: null,
    quantity: null,
    imageUrl: null, // you could also upload the image somewhere later
    categories: cooked.category ?? null,
    nutriScore: null,
    expiry: cooked.expiry_date,
    expiryRaw: `Estimated: ${cooked.reason ?? ""}`.trim(),
  });
}
