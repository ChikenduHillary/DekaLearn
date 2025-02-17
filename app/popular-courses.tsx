"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

interface Course {
  id: string;
  title: string;
  url: string;
  platform: string;
  price?: string;
  thumbnail?: string;
  rating?: number;
  reviews?: number;
  image?: string;
}

interface HistoryResponse {
  history: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, index) => (
      <Card key={index} className="overflow-hidden animate-pulse">
        <CardContent className="p-0">
          <div className="relative">
            <div className="w-16 h-6 bg-gray-200 rounded absolute top-4 left-4" />
            <div className="w-full h-48 bg-gray-200" />
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded-full" />
              ))}
              <div className="w-12 h-4 bg-gray-200 rounded ml-2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="w-16 h-6 bg-gray-200 rounded" />
              <div className="w-20 h-6 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center w-full min-h-[400px] text-center p-8">
    <div className="mb-6 bg-gray-100 p-6 rounded-full">
      <BookOpen className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-2xl font-semibold mb-2">No courses found</h3>
    <p className="text-gray-500 max-w-md mb-4">
      Try searching for your favorite topics like web development, machine
      learning, or digital marketing
    </p>
    <div className="flex items-center text-sm text-gray-400">
      <Search className="w-4 h-4 mr-2" />
      <span>Use the search bar above to discover amazing courses</span>
    </div>
  </div>
);

export default function CoursesPage({ userId }: { userId?: string }) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load course history when component mounts
  useEffect(() => {
    if (userId) {
      loadCourseHistory();
    }
  }, [userId]);

  const loadCourseHistory = async () => {
    if (!userId) return;

    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/history?userId=${userId}&limit=4`);
      const data: HistoryResponse = await response.json();

      if (data.history) {
        setRecentCourses(data.history);
      }
    } catch (error) {
      console.error("Error loading course history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCourseClick = async (course: Course) => {
    if (!userId) return;

    try {
      await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          courseId: course.id,
          title: course.title,
          url: course.url,
          platform: course.platform,
          price: course.price,
          rating: course.rating,
          reviews: course.reviews,
          thumbnail: course.thumbnail,
        }),
      });
    } catch (error) {
      console.error("Error saving course history:", error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    fetchCourses(searchTerm.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchCourses = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses?query=${query}`);
      const data = await response.json();

      const combinedCourses = [
        ...data?.udemy?.map((course: Course) => ({
          ...course,
          platform: "udemy",
        })),
        ...data?.youtube?.map((course: Course) => ({
          ...course,
          platform: "youtube",
        })),
      ];

      setCourses(combinedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourseGrid = (coursesToRender: Course[], title?: string) => (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coursesToRender.map((course, index) => {
          if (!course.title) return null;

          return (
            <Link
              href={course.url}
              key={index}
              onClick={() => handleCourseClick(course)}
              target="blank"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <Badge className="absolute top-4 left-4 z-10">
                      {course?.platform?.toUpperCase()}
                    </Badge>
                    <Image
                      src={course?.thumbnail || "/placeholder.svg"}
                      alt={course?.title}
                      className="w-full h-48 object-cover"
                      width={1000}
                      height={1000}
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-medium line-clamp-2">
                      {course?.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (course?.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-muted-foreground text-sm">
                        ({course?.reviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">
                        {course?.price || "Free"}
                      </span>
                      <div>
                        <Image
                          src={
                            course?.platform === "youtube"
                              ? "/youtube.png"
                              : "/udemy.jpg"
                          }
                          height={100}
                          width={100}
                          alt={course?.platform}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-[#6366F1] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <nav className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-8">
              <h1 className="text-white text-2xl font-bold">eDex</h1>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton>
                  <Button variant="ghost" className="text-white">
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    variant="secondary"
                    className="bg-white text-[#6366F1] hover:bg-white/90"
                  >
                    Start Learning
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 py-16">
            <div className="space-y-8">
              <p className="text-white/90 text-lg font-medium">
                UNLOCK YOUR POTENTIAL
              </p>
              <h2 className="text-white text-4xl lg:text-5xl font-bold leading-tight">
                Discover World-Class Online Courses from Leading Experts
              </h2>
              <p className="text-white/80">
                Explore courses from top universities and industry leaders.
                Learn at your own pace and earn certificates to showcase your
                skills.
              </p>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search courses, skills, or topics..."
                  className="w-full pl-4 pr-12 py-6 rounded-lg placeholder:text-gray-200 outline-none text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#6366F1]"
                  size="icon"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end"></div>
          </div>
        </div>
      </section>

      {/* Course Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Recently Viewed Courses */}
          {userId &&
            recentCourses.length > 0 &&
            !historyLoading &&
            renderCourseGrid(recentCourses, "Recently Viewed Courses")}

          {/* Search Results */}
          {loading ? (
            <LoadingSkeleton />
          ) : courses.length > 0 ? (
            renderCourseGrid(
              courses,
              searchTerm ? "Search Results" : "Popular Courses"
            )
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      {/* Footer section remains the same */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#6366F1]">eDex</h3>
              <p className="text-gray-600">
                Empowering learners worldwide with quality education and skill
                development opportunities.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Explore</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Popular Courses
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Categories
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Skill Paths
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Career Tracks
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Community</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Discussion Forums
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Student Success
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Teaching Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#6366F1]">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2025 eDex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
