export type ExpiryResult = {
  expiry: string | null;
  raw: string | null;
};

export async function extractExpiryDate(file: File): Promise<ExpiryResult> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/extract-expiry", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Expiry extraction failed (${res.status})`);
  }

  const data = await res.json();
  return {
    expiry: data.expiry ?? null,
    raw: data.raw ?? null,
  };
}
