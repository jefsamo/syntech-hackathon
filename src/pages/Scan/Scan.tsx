/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/ScanPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Button,
  Group,
  Alert,
  Loader,
} from "@mantine/core";
import { BrowserMultiFormatReader } from "@zxing/browser";

const Scan = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(true);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isCameraSupported = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  useEffect(() => {
    if (!isCameraSupported) {
      setError(
        "Camera access is not supported in this browser. Try opening the app in Chrome or Safari over HTTPS."
      );
      setScanning(false);
      return;
    }

    const codeReader = new BrowserMultiFormatReader();
    let active = true;

    async function startScanner() {
      try {
        setError(null);
        setScanning(true);
        setBarcode(null);

        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err) => {
            if (!active) return;

            if (result) {
              const text = result.getText();
              setBarcode(text);
              setScanning(false);
              // codeReader.reset();
            }
            // err is expected sometimes while scanning; usually ignore
          }
        );
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to access camera");
        setScanning(false);
      }
    }

    if (videoRef.current) {
      startScanner();
    }

    return () => {
      active = false;
      // codeReader.reset();
    };
  }, [isCameraSupported]);

  const handleRescan = () => {
    // simplest way to restart scanning
    window.location.reload();
  };

  const handleUseBarcode = () => {
    if (!barcode) return;
    console.log("Use barcode:", barcode);
    navigate("/home");
  };

  return (
    <Container size="sm" px="md" py="xl" style={{ minHeight: "100vh" }}>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Scan a product</Title>
            <Text c="dimmed" fz="sm">
              Align the barcode within the frame. The scan will happen
              automatically.
            </Text>
          </div>
          <Button variant="subtle" onClick={() => navigate("/home")}>
            Back
          </Button>
        </Group>

        <Paper
          withBorder
          shadow="sm"
          radius="md"
          p="xs"
          style={{
            overflow: "hidden",
            aspectRatio: "3 / 4",
            maxHeight: 480,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </Paper>

        {scanning && !error && (
          <Group gap="xs">
            <Loader size="sm" />
            <Text fz="sm" c="dimmed">
              Scanning…
            </Text>
          </Group>
        )}

        {error && (
          <Alert color="red" title="Camera error">
            {error}
          </Alert>
        )}

        {barcode && (
          <Paper withBorder radius="md" p="md">
            <Stack gap="xs">
              <Text fw={500}>Barcode detected</Text>
              <Text>{barcode}</Text>
              <Group justify="flex-start" mt="sm">
                <Button onClick={handleUseBarcode}>Use this product</Button>
                <Button variant="outline" onClick={handleRescan}>
                  Scan again
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default Scan;
