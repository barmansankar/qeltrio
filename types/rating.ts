export interface ProductRatingSummary {
  productId: string;
  averageRating: number;
  ratingCount: number;
}

export interface ProductUserRating {
  productId: string;
  userId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRatingState {
  summary: ProductRatingSummary;
  userRating: number | null;
}
