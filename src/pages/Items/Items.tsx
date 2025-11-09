import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { parseExpiryString } from "../../utils/expiryParser";

type StoredProduct = {
  barcode: string;
  name: string | null;
  brand: string | null;
  quantity: string | null;
  imageUrl: string | null;
  categories?: string | null;
  nutriScore?: string | null;
  expiry: string; // "YYYY-MM-DD"
  expiryRaw?: string | null;
  savedAt: string; // ISO string
};

const Items = () => {
  const [items, setItems] = useState<StoredProduct[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("products");
    if (!raw) {
      setItems([]);
      return;
    }

    try {
      const parsed: StoredProduct[] = JSON.parse(raw);

      // sort by expiry ascending
      const sorted = [...parsed].sort((a, b) => {
        const da = new Date(a.expiry).getTime();
        const db = new Date(b.expiry).getTime();
        return da - db;
      });

      setItems(sorted);
    } catch {
      setItems([]);
    }
  }, []);

  const daysUntil = (expiry: string): number | null => {
    const parsed = parseExpiryString(expiry);
    if (!parsed) return null;

    const now = new Date();
    const target = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate()
    ); // normalise to local midnight

    const diffMs = target.getTime() - now.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (expiry: string) => {
    const days = daysUntil(expiry);
    if (days === null) {
      return <Badge color="gray">No expiry</Badge>;
    }

    if (days < 0) {
      return (
        <Badge color="red">
          Expired {-days} day{Math.abs(days) === 1 ? "" : "s"} ago
        </Badge>
      );
    }

    if (days === 0) {
      return <Badge color="orange">Expires today</Badge>;
    }

    if (days <= 3) {
      return (
        <Badge color="orange">
          Expires in {days} day{days === 1 ? "" : "s"}
        </Badge>
      );
    }

    return <Badge color="green">Expires in {days} days</Badge>;
  };

  const handleClearAll = () => {
    localStorage.removeItem("products");
    setItems([]);
  };

  return (
    <Container size="sm" px="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>My items</Title>
            <Text c="dimmed" fz="sm">
              All products you&apos;ve scanned and saved.
            </Text>
          </div>
          <Button variant="subtle" onClick={() => navigate("/home")}>
            Back
          </Button>
        </Group>

        {items.length === 0 ? (
          <Stack gap="sm" mt="md">
            <Text>No items saved yet.</Text>
            <Button onClick={() => navigate("/scan")}>
              Scan your first product
            </Button>
          </Stack>
        ) : (
          <>
            <Group justify="space-between" mb="xs">
              <Text fz="sm" c="dimmed">
                {items.length} item{items.length === 1 ? "" : "s"} saved
              </Text>
              <Button
                variant="outline"
                color="red"
                size="xs"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </Group>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1rem",
              }}
            >
              {items.map((item) => {
                const days = daysUntil(item.expiry);

                return (
                  <Card
                    key={`${item.barcode}-${item.savedAt}`}
                    withBorder
                    radius="md"
                    shadow="sm"
                    padding="md"
                  >
                    <Stack gap="sm">
                      <Group align="flex-start" wrap="nowrap">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.name || "Product image"}
                            width={70}
                            radius="md"
                          />
                        )}
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Text fw={600} lineClamp={2}>
                            {item.name || "Unknown product"}
                          </Text>
                          {item.brand && (
                            <Text fz="sm" c="dimmed">
                              {item.brand}
                            </Text>
                          )}
                          {item.quantity && (
                            <Text fz="xs" c="dimmed">
                              {item.quantity}
                            </Text>
                          )}
                        </Stack>
                      </Group>

                      <Group justify="space-between" align="center">
                        <Stack gap={2}>
                          <Text fz="xs" c="dimmed">
                            Expiry date
                          </Text>
                          <Text fz="sm" fw={500}>
                            {item.expiry}
                          </Text>
                          {item.expiryRaw && (
                            <Text fz="xs" c="dimmed">
                              From label: “{item.expiryRaw}”
                            </Text>
                          )}
                        </Stack>
                        {getExpiryBadge(item.expiry)}
                      </Group>

                      <Text fz="xs" c="dimmed">
                        Barcode: {item.barcode}
                      </Text>

                      {item.savedAt && (
                        <Text fz="xs" c="dimmed">
                          Saved on {new Date(item.savedAt).toLocaleDateString()}
                        </Text>
                      )}

                      {typeof days === "number" && days >= 0 && (
                        <Text fz="xs" c="dimmed">
                          {days === 0
                            ? "Use this today if possible."
                            : days <= 3
                            ? "Consider using this soon."
                            : "Still has some time."}
                        </Text>
                      )}
                    </Stack>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default Items;
