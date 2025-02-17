export interface Course {
  _id: string;
  title: string;
  platform: "udemy" | "coursera" | "youtube";
  instructor: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Platform = Course["platform"];
