import Link from "next/link";
import { Logo } from "./logo";

const footerLinks = {
  Product: [
    { label: "Browse Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Sign In", href: "/signin" },
    { label: "Get Started", href: "/signup" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="page-container py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-body text-sm">
              Built. Owned. Launched. Discover ready-to-use software projects,
              SaaS applications, and digital products. Don&apos;t start from zero.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-label">{section}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300 focus-ring rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-caption">
            © {new Date().getFullYear()} Qeltrio. All rights reserved.
          </p>
          <p className="text-caption">Built. Owned. Launched.</p>
        </div>
      </div>
    </footer>
  );
}
