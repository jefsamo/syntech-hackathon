import { BASE_URL } from "../utils/expiryParser";

export type CookedExpiryResponse = {
  food_name: string | null;
  category: string | null;
  days_after_cooking: number;
  expiry_date: string;
  reason: string | null;
  cooked_at: string;
  storage: "room" | "fridge" | "freezer";
};

// const BASE_URL = "https://syntech-hackathon-backend.onrender.com/api";

export async function estimateCookedExpiry(
  file: File,
  storage: "room" | "fridge" | "freezer",
  cookedAt?: string
): Promise<CookedExpiryResponse> {
  const form = new FormData();
  form.append("image", file);
  form.append("storage", storage);
  if (cookedAt) form.append("cookedAt", cookedAt);

  const res = await fetch(`${BASE_URL}/expiry/estimate-cooked`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Failed to estimate cooked-food expiry (${res.status})`);
  }

  return res.json();
}
