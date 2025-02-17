import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  console.log({ query });

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://youtube138.p.rapidapi.com/search/?q=${query}&hl=en&gl=US`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "youtube138.p.rapidapi.com",
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = response.data.contents.map((item: any, index: number) => ({
      id: item?.video?.videoId ? item?.video?.videoId : index,
      title: item?.video?.title ? item?.video?.title : "",
      url: `https://www.youtube.com/watch?v=${
        item?.video?.videoId ? item?.video?.videoId : ""
      }`,
      thumbnail: item?.video?.thumbnails[0]?.url,
      platform: "YouTube",
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching data from YouTube API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from YouTube API" },
      { status: 500 }
    );
  }
}
