// pages/HomePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Paper,
} from "@mantine/core";

const Home = () => {
  const [name, setName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (!stored) {
      navigate("/");
    } else {
      setName(stored);
    }
  }, [navigate]);

  if (!name) return null;

  const handleScanClick = () => {
    navigate("/scan");
  };

  return (
    <Container size="sm" px="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Hi, {name} 👋</Title>
        <Text c="dimmed">What would you like to do today?</Text>

        <Paper withBorder shadow="xs" radius="md" p="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Button variant="filled" size="md" onClick={handleScanClick}>
              Scan a product
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate("/items")}
            >
              View my items
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => console.log("Settings clicked")}
            >
              Settings
            </Button>

            <Button
              variant="subtle"
              size="md"
              onClick={() => {
                localStorage.removeItem("username");
                navigate("/");
              }}
            >
              Change user
            </Button>
          </SimpleGrid>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Home;
