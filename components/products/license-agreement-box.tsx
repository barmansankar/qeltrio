import { FileText } from "lucide-react";

interface LicenseAgreementBoxProps {
  content: string;
}

export function LicenseAgreementBox({ content }: LicenseAgreementBoxProps) {
  return (
    <section
      className="surface-card border-dashed p-5"
      aria-labelledby="license-agreement-heading"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-zinc-500">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </div>
        <h3
          id="license-agreement-heading"
          className="text-label"
        >
          License Agreement
        </h3>
      </div>

      <div
        className="max-h-52 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-xs leading-relaxed whitespace-pre-line text-zinc-500"
        role="document"
        aria-label="License agreement text"
      >
        {content}
      </div>

      <p className="mt-3 text-caption">
        By proceeding to purchase, you agree to the terms above.
      </p>
    </section>
  );
}
