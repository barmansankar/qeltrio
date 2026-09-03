"use client";

import { useEffect, useRef } from "react";
import { trackProductView } from "@/lib/analytics/client";

interface ProductViewTrackerProps {
  productId: string;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  const trackedProductId = useRef<string | null>(null);

  useEffect(() => {
    if (!productId || trackedProductId.current === productId) {
      return;
    }

    trackedProductId.current = productId;
    void trackProductView(productId);
  }, [productId]);

  return null;
}
