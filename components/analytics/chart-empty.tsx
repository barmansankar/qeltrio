export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-elevated)]">
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}
