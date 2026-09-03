import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { ProductRatingState, ProductRatingSummary } from "@/types/rating";

const RATINGS_COLLECTION = "product_ratings";
const SUMMARY_COLLECTION = "product_rating_summary";

function ratingDocId(productId: string, userId: string) {
  return `${productId}_${userId}`;
}

function mapSummary(
  productId: string,
  data: FirebaseFirestore.DocumentData | undefined,
  fallbackRating = 0,
  fallbackCount = 0
): ProductRatingSummary {
  if (!data) {
    return {
      productId,
      averageRating: fallbackRating,
      ratingCount: fallbackCount,
    };
  }

  return {
    productId,
    averageRating: Number(data.averageRating ?? fallbackRating),
    ratingCount: Number(data.ratingCount ?? fallbackCount),
  };
}

export async function getProductRatingSummary(
  productId: string,
  fallbackRating = 0,
  fallbackCount = 0
): Promise<ProductRatingSummary> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(SUMMARY_COLLECTION).doc(productId).get();
  return mapSummary(productId, snapshot.data(), fallbackRating, fallbackCount);
}

export async function getProductRatingSummaries(
  productIds: string[]
): Promise<Map<string, ProductRatingSummary>> {
  const db = getAdminFirestore();
  const results = new Map<string, ProductRatingSummary>();

  await Promise.all(
    productIds.map(async (productId) => {
      const snapshot = await db.collection(SUMMARY_COLLECTION).doc(productId).get();
      results.set(productId, mapSummary(productId, snapshot.data()));
    })
  );

  return results;
}

export async function getUserProductRating(
  productId: string,
  userId: string
): Promise<number | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(RATINGS_COLLECTION)
    .doc(ratingDocId(productId, userId))
    .get();

  if (!snapshot.exists) return null;
  return Number(snapshot.data()?.rating ?? 0) || null;
}

export async function getProductRatingState(
  productId: string,
  userId: string | null,
  fallbackRating = 0,
  fallbackCount = 0
): Promise<ProductRatingState> {
  const [summary, userRating] = await Promise.all([
    getProductRatingSummary(productId, fallbackRating, fallbackCount),
    userId ? getUserProductRating(productId, userId) : Promise.resolve(null),
  ]);

  return { summary, userRating };
}

export async function submitProductRating(
  productId: string,
  userId: string,
  rating: number
): Promise<ProductRatingState> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("INVALID_RATING");
  }

  const db = getAdminFirestore();
  const ratingRef = db.collection(RATINGS_COLLECTION).doc(ratingDocId(productId, userId));
  const summaryRef = db.collection(SUMMARY_COLLECTION).doc(productId);

  await db.runTransaction(async (transaction) => {
    const existingRating = await transaction.get(ratingRef);
    const existingSummary = await transaction.get(summaryRef);

    const previousRating = existingRating.exists
      ? Number(existingRating.data()?.rating ?? 0)
      : 0;

    const currentCount = existingSummary.exists
      ? Number(existingSummary.data()?.ratingCount ?? 0)
      : 0;
    const currentTotal = existingSummary.exists
      ? Number(existingSummary.data()?.ratingTotal ?? 0)
      : 0;

    const nextCount = existingRating.exists ? currentCount : currentCount + 1;
    const nextTotal = currentTotal - previousRating + rating;
    const nextAverage = nextCount > 0 ? nextTotal / nextCount : 0;

    transaction.set(
      ratingRef,
      {
        productId,
        userId,
        rating,
        updatedAt: FieldValue.serverTimestamp(),
        ...(existingRating.exists
          ? {}
          : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true }
    );

    transaction.set(
      summaryRef,
      {
        productId,
        averageRating: Number(nextAverage.toFixed(2)),
        ratingCount: nextCount,
        ratingTotal: nextTotal,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  return getProductRatingState(productId, userId);
}
