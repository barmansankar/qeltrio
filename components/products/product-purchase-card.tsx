interface ProductPurchaseCardProps {
  children: React.ReactNode;
}

export function ProductPurchaseCard({ children }: ProductPurchaseCardProps) {
  return (
    <div
      id="buy"
      className="surface-card-elevated p-5 sm:p-6"
    >
      {children}
    </div>
  );
}
