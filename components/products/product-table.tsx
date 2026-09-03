"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Package } from "lucide-react";

interface ProductsResponse {
  items: Product[];
  hasMore: boolean;
  nextCursor: string | null;
}

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/products?limit=100");
      if (!response.ok) throw new Error("Failed");
      const data = (await response.json()) as ProductsResponse;
      setProducts(data.items);
    } catch {
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function runAction(
    id: string,
    action: "publish" | "archive" | "delete",
    name: string
  ) {
    if (action === "delete") {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${name}"? This cannot be undone.`
      );
      if (!confirmed) return;

      setActionId(id);
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed");
        await loadProducts();
      } finally {
        setActionId(null);
      }
      return;
    }

    setActionId(id);
    try {
      const response = await fetch(`/api/admin/products/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Failed");
      await loadProducts();
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load products"
        description={error}
        action={{ label: "Try again", onClick: loadProducts }}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="You haven't created any products yet"
        description="Create your first product listing to start selling on the Qeltrio marketplace."
        action={{ label: "Add Product", href: "/dashboard/products/new" }}
      />
    );
  }

  return (
    <div className="surface-card overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] text-caption">
          <tr>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Stats</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-[var(--border)] last:border-0"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-zinc-100">{product.name}</div>
                <div className="text-caption">{product.slug}</div>
              </td>
              <td className="px-4 py-3 text-zinc-400">{product.category}</td>
              <td className="px-4 py-3 text-zinc-300">
                {formatCurrency(product.price, product.currency)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={product.status} featured={product.featured} />
              </td>
              <td className="px-4 py-3 text-caption">
                {product.views} views · {product.downloads} dl · {product.purchases} sales
              </td>
              <td className="px-4 py-3 text-caption">
                {new Date(product.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/products/${product.slug}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {product.status !== "published" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={actionId === product.id}
                      onClick={() => runAction(product.id, "publish", product.name)}
                    >
                      Publish
                    </Button>
                  )}
                  {product.status !== "archived" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionId === product.id}
                      onClick={() => runAction(product.id, "archive", product.name)}
                    >
                      Archive
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={actionId === product.id}
                    onClick={() => runAction(product.id, "delete", product.name)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({
  status,
  featured,
}: {
  status: Product["status"];
  featured: boolean;
}) {
  const variant =
    status === "published" ? "success" : status === "draft" ? "warning" : "outline";

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>{status}</Badge>
      {featured && <Badge variant="accent">Featured</Badge>}
    </div>
  );
}
