import React, { useState, useEffect } from "react";
import { fetchUserTravelCourses } from "../utils/supabase";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";
import PathUI from "./PathUI";
import { useRouter } from "next/router";

const WriteCourseList = ({ travelType = "all" }) => {
  const router = useRouter();
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
      const { data, hasMore: more } = await fetchUserTravelCourses(page);
      if (data) {
        const filteredData =
          travelType === "all"
            ? data
            : data.filter((course) => course.travel_type === travelType);
        setCourses((prev) =>
          page === 1 ? filteredData : [...prev, ...filteredData]
        );
        setHasMore(more);
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

  const handleCourseSelect = (course) => {
    // Store selected course data in localStorage
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    router.push("/write");
  };

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
            <div
              key={course.course_id}
              onClick={() => handleCourseSelect(course)}
              className="cursor-pointer block no-underline"
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
                      {course.travel_type === "plan" ? "Planned" : "Completed"}
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
                                Day {index + 1}
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
            </div>
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

export default WriteCourseList;
