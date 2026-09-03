/**
 * Development-only Firestore product seeder.
 *
 * Usage:
 *   npm run seed:products
 *
 * Never run against production intentionally.
 * Skips products whose slug already exists.
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { parseServiceAccountFromEnvFile } from "../lib/firebase/load-env-local";
import { buildSearchKeywords, productToFirestore, slugifyProductName } from "../lib/products/utils";

const samples = [
  {
    name: "AI Content Generator",
    shortDescription: "AI-powered content generation platform for teams and creators.",
    description:
      "A complete AI content generation application with authentication, dashboard, prompt templates, and generation history. Built for production deployment with Next.js and Firebase.",
    category: "AI",
    price: 49,
    technologies: ["Next.js", "TypeScript", "Firebase", "OpenAI"],
    features: ["Authentication", "Dashboard", "AI generation", "Prompt templates"],
    version: "1.0.0",
    requirements: "Node.js 20+\nFirebase project",
    featured: true,
    status: "published" as const,
  },
  {
    name: "SaaS Starter Kit",
    shortDescription: "Production-ready SaaS boilerplate with auth and billing hooks.",
    description:
      "Launch your SaaS faster with dashboards, user management, subscription-ready architecture, and a polished marketing site.",
    category: "SaaS",
    price: 149,
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase"],
    features: ["Auth", "Admin dashboard", "Billing-ready", "Marketing pages"],
    version: "2.1.0",
    requirements: "Node.js 20+",
    featured: true,
    status: "published" as const,
  },
  {
    name: "Developer API Toolkit",
    shortDescription: "API explorer, docs, and webhook debugger for backend teams.",
    description:
      "Ship APIs faster with interactive exploration, OpenAPI documentation, and webhook debugging in one developer portal.",
    category: "Developer Tools",
    price: 129,
    technologies: ["Next.js", "Node.js", "OpenAPI"],
    features: ["API explorer", "Docs generator", "Webhook debugger"],
    version: "1.4.0",
    requirements: "Node.js 20+\nPostgreSQL or SQLite",
    featured: false,
    status: "published" as const,
  },
];

async function main() {
  const serviceAccount = parseServiceAccountFromEnvFile();

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });
  }

  const db = getFirestore();
  let created = 0;
  let skipped = 0;

  for (const sample of samples) {
    const slug = slugifyProductName(sample.name);
    const existing = await db
      .collection("products")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!existing.empty) {
      skipped += 1;
      console.log(`Skipped (exists): ${slug}`);
      continue;
    }

    const now = Timestamp.now();
    const product = {
      name: sample.name,
      slug,
      shortDescription: sample.shortDescription,
      description: sample.description,
      category: sample.category,
      price: sample.price,
      currency: "USD",
      thumbnailUrl: "",
      screenshots: [],
      technologies: sample.technologies,
      features: sample.features,
      version: sample.version,
      requirements: sample.requirements,
      status: sample.status,
      featured: sample.featured,
      views: 0,
      downloads: 0,
      purchases: 0,
      searchKeywords: buildSearchKeywords({
        name: sample.name,
        slug,
        category: sample.category,
        technologies: sample.technologies,
        shortDescription: sample.shortDescription,
      }),
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };

    await db.collection("products").add({
      ...productToFirestore(product),
      createdAt: now,
      updatedAt: now,
    });

    created += 1;
    console.log(`Created: ${slug}`);
  }

  console.log(`Done. Created ${created}, skipped ${skipped}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
