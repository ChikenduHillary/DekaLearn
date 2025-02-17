import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const data = {
    page: 1,
    page_size: 10,
    ratings: "",
    instructional_level: [],
    lang: [],
    price: [],
    duration: [],
    subtitles_lang: [],
    sort: "popularity",
    features: [],
    locale: "en_US",
    extract_pricing: true,
  };

  try {
    const response = await axios.post(
      "https://udemy-api2.p.rapidapi.com/v1/udemy/search",
      data,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "udemy-api2.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        params: {
          text: query,
        },
      }
    );

    // Map the response data to the desired format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = response.data.data.courses.map((course: any) => ({
      id: course.course_id,
      title: course.title,
      url: `https://www.udemy.com${course.url}`,
      platform: "Udemy",
      price: course.purchase.price.price_string,
      rating: course.rating,
      reviews: course.num_reviews,
      thumbnail: course.images[4],
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching data from Udemy API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Udemy API" },
      { status: 500 }
    );
  }
}
