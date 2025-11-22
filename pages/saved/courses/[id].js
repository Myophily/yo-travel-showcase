import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { supabase, deleteTravelCourse } from "../../../utils/supabase";
import PathUI from "../../../components/PathUI";
import withAuth from "../../../utils/withAuth";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ErrorBoundary from "../../../components/ErrorBoundary";

const TripMap = dynamic(() => import("../../../components/TripMap"), {
  ssr: false,
});

const CourseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("travel_courses")
        .select(
          `
          *,
          daily_courses (
            *
          )
        `
        )
        .eq("course_id", id)
        .single();

      if (courseError) throw courseError;
      if (!courseData) throw new Error("Course not found");

      // Process daily_courses to handle potential duplicates
      // Group by day and take the most recent for each day
      const processedDailyCourses = [];
      const dayMap = new Map();

      if (courseData.daily_courses && courseData.daily_courses.length > 0) {
        // Sort by created_at in descending order (newest first)
        const sortedCourses = [...courseData.daily_courses].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        // Keep only the most recent entry for each day
        sortedCourses.forEach((course) => {
          if (!dayMap.has(course.day)) {
            dayMap.set(course.day, course);
            processedDailyCourses.push(course);
          }
        });
      }

      // Sort by day in ascending order
      processedDailyCourses.sort((a, b) => a.day - b.day);

      // Replace the original daily_courses with the processed ones
      courseData.daily_courses = processedDailyCourses;

      setCourse(courseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        setLoading(true);
        const { error } = await deleteTravelCourse(id);
        if (error) throw error;

        // Redirect to the courses list page after successful deletion
        router.push("/saved/courses");
      } catch (error) {
        console.error("Failed to delete course:", error);
        alert("Failed to delete course. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatRegions = (regions) => {
    if (!regions || !Array.isArray(regions)) return "";
    return regions.map((region) => region).join(", ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="self-stretch px-8 text-center">
        <h1 className="text-xl font-semibold text-red-500 mb-4">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="self-stretch px-8 text-center">
        <h1 className="text-xl font-semibold text-darkslategray mb-4">
          Course not found
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <ErrorBoundary>
        <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full">
          <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
            <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray">
              {course.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-gray-600">
              <span>
                {new Date(course.start_date).toLocaleDateString()} -{" "}
                {new Date(course.end_date).toLocaleDateString()}
              </span>
              {course.region && (
                <span>
                  <span className="bg-mistyrose text-orangered px-2 py-1 rounded-lg">
                    {formatRegions(course.region)}
                  </span>
                </span>
              )}
              <span className="text-gray-500">
                {course.travel_type === "plan"
                  ? "여행 갈 곳"
                  : "여행 갔다온 곳"}
              </span>
            </div>
          </div>
        </section>

        {course.daily_courses.map((dailyCourse, index) => (
          <section
            key={dailyCourse.daily_course_id}
            className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full"
          >
            <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
              <div className="self-stretch rounded-lg bg-white shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center text-darkslategray">
                    <span className="w-8 h-8 rounded-lg bg-orangered text-white flex items-center justify-center mr-3 text-sm">
                      {index + 1}
                    </span>
                    {index + 1} 일차
                  </h2>

                  {dailyCourse.points && dailyCourse.points.length > 0 && (
                    <div className="space-y-6">
                      <div className="self-stretch">
                        <PathUI places={dailyCourse.points} />
                      </div>

                      <div className="self-stretch h-[300px] rounded-lg overflow-hidden">
                        <TripMap places={dailyCourse.points} />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-darkslategray">
                          방문 장소:
                        </h3>
                        <div className="flex flex-col gap-2">
                          {dailyCourse.points.map((point, pointIndex) => (
                            <div
                              key={pointIndex}
                              className="flex items-center gap-2 text-xs text-darkslategray"
                            >
                              <span className="w-5 h-5 rounded-lg bg-mistyrose text-orangered flex items-center justify-center">
                                {pointIndex + 1}
                              </span>
                              {point.name}
                              {point.trans && (
                                <span className="text-gray-500 ml-2">
                                  ({point.trans})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
        {/* Add delete button here */}

        <div className="self-stretch flex justify-end mt-2 mb-2 px-8 gap-2">
          <button
            onClick={() => router.push(`/make?edit=${id}`)}
            className="px-4 py-2 text-sm bg-mistyrose text-orangered rounded-lg hover:bg-orangered hover:text-white transition-colors"
            disabled={loading}
          >
            {loading ? "로딩 중..." : "수정"}
          </button>
          <button
            onClick={handleDeleteCourse}
            className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
            disabled={loading}
          >
            {loading ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default withAuth(CourseDetail);
