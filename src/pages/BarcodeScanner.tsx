import { useProductCombinationsByBarcode } from "@/features/products/hooks/useProductCombination";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/utils/formatters";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { Html5Qrcode } from "html5-qrcode";
import Loader from "@/components/Loader";
import { Link } from "react-router";
import { toast } from "sonner";
import React from "react";

let audioCtx: AudioContext | null = null;

const playBeep = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.warn("AudioContext not supported or failed to play beep", e);
  }
};

const BarcodeScanner = () => {
  const [scannedResult, setScannedResult] = React.useState("");
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-container";
  const debouncedQuery = useDebounce(scannedResult, 500);
  const { data: categories } = useCategories();

  const { data, isLoading, isFetching, isError, error } =
    useProductCombinationsByBarcode(debouncedQuery);

  React.useEffect(() => {
    if (isError && error) {
      toast.dismiss("fetch-product");
      toast.error(error.message);
    }
  }, [isError, error]);

  React.useEffect(() => {
    if (isFetching) {
      toast.loading("Fetching product...", { id: "fetch-product" });
    } else {
      toast.dismiss("fetch-product");
    }
  }, [isFetching]);

  React.useEffect(() => {
    if (data) {
      playBeep();
    }
  }, [data]);

  React.useEffect(() => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(containerId);
    }

    const startScanner = async () => {
      try {
        await scannerRef.current?.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 100 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            setScannedResult(decodedText);

            // Optional: stop scanning after first success
            // stopScanner();
          },
          (errorMessage) => {
            // ignore noise/errors during scanning
            toast.error(errorMessage);
          },
        );
      } catch (err) {
        console.error("Scanner failed to start:", err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        stopScanner();
      }
    };
  }, []);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          console.log("Scanner stopped and cleared.");
        })
        .catch((err) => console.error("Failed to stop scanner", err));
    }
  };

  return (
    <div>
      <div
        id={containerId}
        style={{
          width: "100%",
          minHeight: "200px",
          backgroundColor: "#f0f0f0",
          overflow: "hidden", // Prevents video leaking out
        }}
      />

      <div className="relative">
        {isLoading && <Loader />}
        <Input
          className="rounded-none"
          type="text"
          value={scannedResult}
          placeholder="Scan Barcode or Enter SKU eg: 00000123"
          onChange={(e) => setScannedResult(e.target.value)}
        />

        {scannedResult && (
          <div className="p-4 w-full ">
            {data && (
              <div className="font-semibold text-foreground gap-4 flex flex-col">
                <div className="flex justify-between ">
                  <Link
                    to={`/products/${data.productId}`}
                    className="flex items-center gap-2"
                  >
                    <ColorBadge colorMap={UNIT_COLOR}>{data.unit}</ColorBadge>
                    {data.name}
                  </Link>
                </div>
                <div className="flex justify-between font-bold">
                  {formatCurrency(data.price || 0)}
                </div>

                <div className="text-sm ">
                  <div className="flex justify-between ">
                    <span className="text-muted-foreground ">Category: </span>
                    {categories?.find((c) => c.id === data.product.categoryId)
                      ?.name || "Uncategorized"}
                  </div>

                  <div className="flex justify-between ">
                    <span className="text-muted-foreground ">SKU: </span>
                    {data.sku}
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Average Price: </span>
                    {formatCurrency(data.inventory?.averagePrice || 0)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground  ">Stocks: </span>
                    {Number(data.inventory?.quantity)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
