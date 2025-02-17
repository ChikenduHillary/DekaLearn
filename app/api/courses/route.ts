import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const [youtubeResponse, udemyResponse] = await Promise.all([
      fetch(`https://deka-learn.vercel.app/api/youtube?query=${query}`),
      fetch(`https://deka-learn.vercel.app/api/udemy?query=${query}`),
    ]);

    const youtube = await youtubeResponse.json();
    const udemy = await udemyResponse.json();

    return NextResponse.json({ youtube, udemy });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
