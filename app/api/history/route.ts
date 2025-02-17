import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Define the Mongoose schema and model
interface ICourseHistory extends mongoose.Document {
  userId: string;
  courseId: string;
  title: string;
  url: string;
  platform: string;
  price?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  timestamp: Date;
}

const CourseHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  platform: { type: String, required: true },
  price: { type: String },
  rating: { type: Number },
  reviews: { type: Number },
  thumbnail: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const CourseHistory =
  mongoose.models.CourseHistory ||
  mongoose.model<ICourseHistory>("CourseHistory", CourseHistorySchema);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI!;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

// POST: Store course history
export async function POST(request: Request) {
  const {
    userId,
    courseId,
    title,
    url,
    platform,
    price,
    rating,
    reviews,
    thumbnail,
  } = await request.json();

  if (!userId || !courseId || !title || !url || !platform) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    // Check if this course was already viewed by the user recently (within 24 hours)
    const existingEntry = await CourseHistory.findOne({
      userId,
      courseId,
      timestamp: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    });

    if (existingEntry) {
      // Update the timestamp of the existing entry
      existingEntry.timestamp = new Date();
      await existingEntry.save();
    } else {
      // Insert new history entry
      await CourseHistory.create({
        userId,
        courseId,
        title,
        url,
        platform,
        price,
        rating,
        reviews,
        thumbnail,
        timestamp: new Date(),
      });
    }

    return NextResponse.json(
      { message: "Course history saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving course history:", error);
    return NextResponse.json(
      { error: "Failed to save course history" },
      { status: 500 }
    );
  }
}

// GET: Retrieve course history for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await CourseHistory.countDocuments({ userId });

    // Get paginated history entries
    const history = await CourseHistory.find({ userId })
      .sort({ timestamp: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        history,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving course history:", error);
    return NextResponse.json(
      { error: "Failed to retrieve course history" },
      { status: 500 }
    );
  }
}

// DELETE: Clear course history for a user
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const query = courseId ? { userId, courseId } : { userId };

    const result = await CourseHistory.deleteMany(query);

    return NextResponse.json(
      {
        message: "Course history deleted successfully",
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course history:", error);
    return NextResponse.json(
      { error: "Failed to delete course history" },
      { status: 500 }
    );
  }
}
