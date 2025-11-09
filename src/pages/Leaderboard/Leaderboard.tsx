/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/LeaderboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Stack,
  Table,
  Button,
  Loader,
} from "@mantine/core";
import { fetchLeaderboard } from "../../api/items";

type Entry = {
  username: string;
  itemCount: number;
};

const Leaderboard = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboard(10);
        setEntries(data.entries);
      } catch (e: any) {
        setError(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Container size="sm" px="md" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={2}>Leaderboard</Title>
          <Text c="dimmed" fz="sm">
            Ranked by number of items added.
          </Text>
        </div>

        <Button variant="subtle" onClick={() => navigate("/home")}>
          Back
        </Button>

        {loading && (
          <Stack align="center" gap="xs">
            <Loader size="sm" />
            <Text fz="sm" c="dimmed">
              Loading…
            </Text>
          </Stack>
        )}

        {error && <Text c="red">{error}</Text>}

        {!loading && !error && entries.length === 0 && (
          <Text>No data yet. Be the first to add items!</Text>
        )}

        {!loading && entries.length > 0 && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th align="right">Items</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.map((e, index) => (
                <Table.Tr key={e.username}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>{e.username}</Table.Td>
                  <Table.Td align="right">{e.itemCount}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Container>
  );
};

export default Leaderboard;
