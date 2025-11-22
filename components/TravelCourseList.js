import React, { useState, useEffect } from "react";
import { fetchUserTravelCourses } from "../utils/supabase";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";
import PathUI from "./PathUI";

const TravelCourseList = ({ travelType = "all" }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [page, travelType]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, hasMore } = await fetchUserTravelCourses(page);
      
      if (data) {
        // Process data to handle potential duplicates in daily_courses
        const processedData = data.map(course => {
          if (course.daily_courses && course.daily_courses.length > 0) {
            // Group by day and take the most recent entry for each day
            const dayMap = new Map();
            const sortedCourses = [...course.daily_courses].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            
            const processedDailyCourses = [];
            sortedCourses.forEach(dailyCourse => {
              if (!dayMap.has(dailyCourse.day)) {
                dayMap.set(dailyCourse.day, dailyCourse);
                processedDailyCourses.push(dailyCourse);
              }
            });
            
            // Sort by day in ascending order
            processedDailyCourses.sort((a, b) => a.day - b.day);
            
            // Replace with processed courses
            return {
              ...course,
              daily_courses: processedDailyCourses
            };
          }
          return course;
        });
        
        const filteredData =
          travelType === "all"
            ? processedData
            : processedData.filter((course) => course.travel_type === travelType);
            
        setCourses((prev) =>
          page === 1 ? filteredData : [...prev, ...filteredData]
        );
        setHasMore(hasMore);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="w-full flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">코스가 없습니다.</p>
          <Link
            href="/make"
            className="mt-4 inline-block bg-orangered text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
          >
            코스 만들기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Link
              key={course.course_id}
              href={`/saved/courses/${course.course_id}`}
              className="block no-underline"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-darkslategray mb-2">
                        {course.travel_type === "plan" ? "🗺️ " : "📝 "}
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(course.start_date).toLocaleDateString()} -{" "}
                        {new Date(course.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-mistyrose text-orangered px-3 py-1 rounded-full text-sm">
                      {course.travel_type === "plan" ? "갈 곳" : "갔다온 곳"}
                    </span>
                  </div>

                  {course.daily_courses && course.daily_courses.length > 0 && (
                    <div className="mt-4">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {course.daily_courses.map((day, index) => (
                          <div key={index} className="flex-none w-64">
                            <div className="relative">
                              <PathUI places={day.points || []} />
                              <div className="absolute bottom-1 right-1 bg-white/80 px-2 rounded-full text-xs">
                                {index + 1} 일차
                              </div>
                            </div>
                            <div className="mt-1 text-center text-xs text-gray-600">
                              {Array.isArray(day.points)
                                ? `${day.points.length} stops`
                                : "0 stops"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-mistyrose text-orangered px-6 py-2 rounded-full hover:bg-orangered hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? "로딩 중..." : "더보기"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelCourseList;
