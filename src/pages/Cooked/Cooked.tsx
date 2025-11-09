/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/CookedPage.tsx
import { useState } from "react";
import {
  Button,
  Container,
  Stack,
  Title,
  Text,
  Select,
  Alert,
  Group,
  Loader,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
// import { estimateCookedExpiry, CookedExpiryResponse } from '../api/cooked';
import { saveCookedItem } from "../../api/items";
import {
  estimateCookedExpiry,
  type CookedExpiryResponse,
} from "../../api/cooked";

export function CookedPage() {
  const [file, setFile] = useState<File | null>(null);
  const [storage, setStorage] = useState<"room" | "fridge" | "freezer" | "">(
    "fridge"
  );
  const [cookedAt, setCookedAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CookedExpiryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEstimate = async () => {
    if (!file || !storage) return;

    try {
      setLoading(true);
      setError(null);
      const res = await estimateCookedExpiry(
        file,
        storage as "room" | "fridge" | "freezer",
        cookedAt || undefined
      );
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Failed to estimate expiry");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    const username = localStorage.getItem("username") || "Anonymous";

    await saveCookedItem(username, result);

    const itemsRaw = localStorage.getItem("products");
    const existing = itemsRaw ? JSON.parse(itemsRaw) : [];
    existing.push({
      barcode: "COOKED-" + Date.now(),
      name: result.food_name ?? "Cooked meal",
      brand: null,
      quantity: null,
      imageUrl: null,
      categories: result.category,
      nutriScore: null,
      expiry: result.expiry_date,
      expiryRaw: `Estimated: ${result.reason ?? ""}`,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("products", JSON.stringify(existing));

    navigate("/items");
  };

  return (
    <Container size="sm" px="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Add cooked food</Title>
            <Text c="dimmed" fz="sm">
              Snap your leftovers and we&apos;ll estimate how long they might
              stay safe.
            </Text>
          </div>
          <Button variant="subtle" onClick={() => navigate("/home")}>
            Back
          </Button>
        </Group>

        <Stack gap="sm">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              setResult(null);
            }}
          />

          <Select
            label="Where will you store it?"
            placeholder="Select storage"
            data={[
              { value: "room", label: "Room temperature" },
              { value: "fridge", label: "Fridge" },
              { value: "freezer", label: "Freezer" },
            ]}
            value={storage}
            onChange={(v) => {
              setStorage((v as any) ?? "");
            }}
          />

          <Text fz="xs" c="dimmed">
            Cooked date (optional, defaults to today):
          </Text>
          <input
            type="date"
            value={cookedAt}
            onChange={(e) => setCookedAt(e.target.value)}
          />

          <Button
            onClick={handleEstimate}
            disabled={!file || !storage || loading}
          >
            Estimate expiry
          </Button>
        </Stack>

        {loading && (
          <Group gap="xs">
            <Loader size="sm" />
            <Text c="dimmed" fz="sm">
              Asking AI for a safe estimate…
            </Text>
          </Group>
        )}

        {error && <Alert color="red">{error}</Alert>}

        {result && (
          <Alert color="yellow" title="Estimated expiry">
            <Text>
              Food: <strong>{result.food_name ?? "Unknown dish"}</strong>
            </Text>
            <Text>
              Estimated expiry date: <strong>{result.expiry_date}</strong>
            </Text>
            <Text fz="sm" c="dimmed" mt="xs">
              Reason: {result.reason}
            </Text>
            <Text fz="xs" c="red" mt="xs">
              This is only an estimate. Always use your own judgement and follow
              food safety guidelines.
            </Text>
            <Button mt="md" onClick={handleSave}>
              Save to my items
            </Button>
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
