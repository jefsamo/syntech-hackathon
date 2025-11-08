/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/openFoodFacts.ts

export type OffRawResponse = {
  status: number;
  status_verbose: string;
  code: string;
  product?: any;
};

export type ProductSummary = {
  barcode: string;
  name: string | null;
  brand: string | null;
  quantity: string | null;
  imageUrl: string | null;
  categories: string | null;
  nutriScore: string | null;
  //nothin
};

export async function fetchProductByBarcode(
  barcode: string
): Promise<ProductSummary> {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open Food Facts request failed (${res.status})`);
  }

  const data: OffRawResponse = await res.json();

  if (data.status !== 1 || !data.product) {
    throw new Error("Product not found in Open Food Facts");
  }

  const p = data.product;

  return {
    barcode: data.code,
    name: p.product_name || null,
    brand: p.brands || null,
    quantity: p.quantity || null,
    imageUrl: p.image_url || null,
    categories: p.categories || null,
    nutriScore: p.nutriscore_grade || null, // often "a", "b", "c", etc.
  };
}
