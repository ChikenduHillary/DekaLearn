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
    const response = await fetch(
      `https://collection-for-coursera-courses.p.rapidapi.com/rapidapi/course/get_course.php?page_no=1&course_institution=${query}`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "collection-for-coursera-courses.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = data.courses.map((course: any) => ({
      id: course.course_id,
      title: course.course_name,
      url: course.course_url,
      platform: "Coursera",
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching data from Coursera API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Coursera API" },
      { status: 500 }
    );
  }
}
