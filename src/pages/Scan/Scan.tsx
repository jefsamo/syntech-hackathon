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
  Image,
  Card,
} from "@mantine/core";
import { BrowserMultiFormatReader } from "@zxing/browser";
// import {
//   fetchProductByBarcode,
//   type ProductSummary,
// } from "../../api/OpenFoodFacts";
import { extractExpiryDate, type ExpiryResult } from "../../api/expiry";

type Step = "barcode" | "expiry" | "summary";

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

async function fetchProductByBarcode(barcode: string): Promise<ProductSummary> {
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

const Scan = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [step, setStep] = useState<Step>("barcode");

  const [scanning, setScanning] = useState(true);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  const [expiryLoading, setExpiryLoading] = useState(false);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<ExpiryResult | null>(null);

  const navigate = useNavigate();

  const isCameraSupported = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // Step 1: barcode scanning
  useEffect(() => {
    if (step !== "barcode") return;
    if (!isCameraSupported) {
      setScanError(
        "Camera access is not supported in this browser. Try Chrome or Safari over HTTPS."
      );
      setScanning(false);
      return;
    }

    const codeReader = new BrowserMultiFormatReader();
    let active = true;

    async function startScanner() {
      try {
        setScanError(null);
        setScanning(true);
        setBarcode(null);
        setProduct(null);
        setProductError(null);

        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, _err) => {
            if (!active) return;

            if (result) {
              const text = result.getText();
              setBarcode(text);
              setScanning(false);
              //   codeReader.reset();
            }
            // ignore err during scanning
          }
        );
      } catch (e: any) {
        console.error(e);
        setScanError(e?.message || "Failed to access camera");
        setScanning(false);
      }
    }

    if (videoRef.current) {
      startScanner();
    }

    return () => {
      active = false;
      //   codeReader.reset();
    };
  }, [isCameraSupported, step]);

  // When barcode is detected, fetch product
  useEffect(() => {
    if (!barcode) return;

    const loadProduct = async () => {
      try {
        setProductLoading(true);
        setProductError(null);
        const summary = await fetchProductByBarcode(barcode);
        setProduct(summary);
      } catch (e: any) {
        console.error(e);
        setProductError(e?.message || "Could not fetch product details");
        setProduct(null);
      } finally {
        setProductLoading(false);
      }
    };

    loadProduct();
  }, [barcode]);

  const handleGoToExpiryStep = () => {
    if (!product) return;
    setStep("expiry");
  };

  const handleExpiryFileChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setExpiryLoading(true);
      setExpiryError(null);
      const result = await extractExpiryDate(file);
      if (!result.expiry) {
        setExpiryError(
          "Could not detect an expiry date. Try taking a clearer photo."
        );
        setExpiry(null);
        return;
      }
      setExpiry(result);
      setStep("summary");
    } catch (err: any) {
      console.error(err);
      setExpiryError(err?.message || "Failed to extract expiry date");
      setExpiry(null);
    } finally {
      setExpiryLoading(false);
      // reset file input value so user can re-upload if needed
      e.target.value = "";
    }
  };

  // Save combined info to localStorage
  const handleSaveToLocalStorage = () => {
    if (!product || !expiry || !expiry.expiry) return;

    const existingRaw = localStorage.getItem("products");
    const existing = existingRaw ? JSON.parse(existingRaw) : [];

    const newItem = {
      ...product,
      expiry: expiry.expiry,
      expiryRaw: expiry.raw,
      savedAt: new Date().toISOString(),
    };

    const updated = [...existing, newItem];
    localStorage.setItem("products", JSON.stringify(updated));

    navigate("/home");
  };

  const handleRestart = () => {
    setStep("barcode");
    setBarcode(null);
    setProduct(null);
    setProductError(null);
    setExpiry(null);
    setExpiryError(null);
  };

  return (
    <Container size="sm" px="md" py="xl" style={{ minHeight: "100vh" }}>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Scan a product</Title>
            {step === "barcode" && (
              <Text c="dimmed" fz="sm">
                Step 1 of 2 – Scan the product barcode.
              </Text>
            )}
            {step === "expiry" && (
              <Text c="dimmed" fz="sm">
                Step 2 of 2 – Take a clear photo of the expiry date label.
              </Text>
            )}
            {step === "summary" && (
              <Text c="dimmed" fz="sm">
                Review and save this product to your list.
              </Text>
            )}
          </div>
          <Button variant="subtle" onClick={() => navigate("/home")}>
            Back
          </Button>
        </Group>

        {/* STEP 1: BARCODE SCANNING */}
        {step === "barcode" && (
          <>
            {isCameraSupported && (
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
            )}

            {scanning && !scanError && (
              <Group gap="xs">
                <Loader size="sm" />
                <Text fz="sm" c="dimmed">
                  Scanning for barcode…
                </Text>
              </Group>
            )}

            {scanError && (
              <Alert color="red" title="Camera error">
                {scanError}
              </Alert>
            )}

            {barcode && (
              <Stack gap="xs">
                <Text fz="sm" c="dimmed">
                  Detected barcode: <strong>{barcode}</strong>
                </Text>

                {productLoading && (
                  <Group gap="xs">
                    <Loader size="sm" />
                    <Text fz="sm" c="dimmed">
                      Fetching product details…
                    </Text>
                  </Group>
                )}

                {productError && (
                  <Alert color="red" title="Product lookup failed">
                    {productError}
                  </Alert>
                )}

                {product && (
                  <Card withBorder radius="md" shadow="sm" padding="md">
                    <Stack gap="sm">
                      <Group align="flex-start" wrap="nowrap">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt={product.name || "Product image"}
                            width={90}
                            radius="md"
                          />
                        )}
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Text fw={600}>
                            {product.name || "Unknown product"}
                          </Text>
                          {product.brand && (
                            <Text fz="sm" c="dimmed">
                              Brand: {product.brand}
                            </Text>
                          )}
                          {product.quantity && (
                            <Text fz="sm" c="dimmed">
                              Quantity: {product.quantity}
                            </Text>
                          )}
                        </Stack>
                      </Group>

                      <Group mt="sm">
                        <Button onClick={handleGoToExpiryStep}>
                          Next: scan expiry date
                        </Button>
                        <Button variant="outline" onClick={handleRestart}>
                          Start over
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                )}
              </Stack>
            )}
          </>
        )}

        {/* STEP 2: EXPIRY CAPTURE */}
        {step === "expiry" && (
          <Stack gap="md">
            <Card withBorder radius="md" shadow="xs" padding="md">
              <Stack gap="xs">
                <Text fw={500}>Take a photo of the expiry date</Text>
                <Text fz="sm" c="dimmed">
                  Make sure the label is clear and readable (e.g. &quot;Best
                  before 30/11/25&quot;).
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleExpiryFileChange}
                />
                {expiryLoading && (
                  <Group gap="xs" mt="sm">
                    <Loader size="sm" />
                    <Text fz="sm" c="dimmed">
                      Reading expiry date…
                    </Text>
                  </Group>
                )}
                {expiryError && (
                  <Alert mt="sm" color="red" title="Expiry scan failed">
                    {expiryError}
                  </Alert>
                )}
              </Stack>
            </Card>
            <Button variant="outline" onClick={handleRestart}>
              Start over
            </Button>
          </Stack>
        )}

        {/* STEP 3: SUMMARY & SAVE */}
        {step === "summary" && product && expiry && (
          <Stack gap="md">
            <Card withBorder radius="md" shadow="sm" padding="md">
              <Stack gap="sm">
                <Text fw={600}>Product summary</Text>
                <Group align="flex-start" wrap="nowrap">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.name || "Product image"}
                      width={90}
                      radius="md"
                    />
                  )}
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text fw={600}>{product.name || "Unknown product"}</Text>
                    {product.brand && (
                      <Text fz="sm" c="dimmed">
                        Brand: {product.brand}
                      </Text>
                    )}
                    {product.quantity && (
                      <Text fz="sm" c="dimmed">
                        Quantity: {product.quantity}
                      </Text>
                    )}
                    <Text fz="sm">
                      Barcode: <strong>{product.barcode}</strong>
                    </Text>
                    <Text fz="sm" c="green">
                      Expiry date: <strong>{expiry.expiry}</strong>
                    </Text>
                    {expiry.raw && (
                      <Text fz="xs" c="dimmed">
                        Detected from label: “{expiry.raw}”
                      </Text>
                    )}
                  </Stack>
                </Group>

                <Group mt="md">
                  <Button onClick={handleSaveToLocalStorage}>
                    Save to my items
                  </Button>
                  <Button variant="outline" onClick={handleRestart}>
                    Scan another product
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default Scan;
