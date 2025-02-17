import PopularCourses from "./popular-courses";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <main>
      <PopularCourses userId={user?.id} />
    </main>
  );
}
