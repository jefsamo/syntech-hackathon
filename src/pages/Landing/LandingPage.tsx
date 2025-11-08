// pages/NamePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Paper,
  TextInput,
  Title,
  Stack,
  Text,
} from "@mantine/core";

const Landing = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Persist in localStorage
    localStorage.setItem("username", trimmed);

    // Redirect to home page
    navigate("/home");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Container
      size="xs"
      px="md"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Paper
        withBorder
        shadow="sm"
        p="lg"
        radius="md"
        style={{ width: "100%" }}
      >
        <Stack gap="md">
          <Title order={2} ta="center">
            Welcome
          </Title>
          <Text ta="center" c="dimmed" fz="sm">
            Enter your name to get started
          </Text>

          <TextInput
            label="Your name"
            placeholder="e.g. Sarah"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />

          <Button fullWidth onClick={handleSubmit} disabled={!name.trim()}>
            Continue
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Landing;
