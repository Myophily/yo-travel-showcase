import React, { useState, useEffect, useCallback, useMemo } from "react";
import PostItem from "./PostItem";
import { fetchTravelCourses } from "../utils/supabase";
import Link from "next/link";
import ListSkeleton from "./ListSkeleton";
import Pagination from "./Pagination";

const CourseList = ({
  selectedRegion,
  selectedCities,
  selectedTransportation,
  sortMethod,
  savedOnly,
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Create a cache key for the current filter state
  const filterKey = useMemo(() => {
    const cities = Object.values(selectedCities).flat();
    return JSON.stringify({
      region: selectedRegion,
      cities,
      transportation: selectedTransportation,
      sort: sortMethod,
      page: currentPage,
    });
  }, [
    selectedRegion,
    selectedCities,
    selectedTransportation,
    sortMethod,
    currentPage,
  ]);

  // Load courses based on filters
  useEffect(() => {
    let isActive = true;

    const loadCourses = async () => {
      setLoading(true);
      try {
        const allSelectedCities = Object.values(selectedCities).flat();

        const { data, count } = await fetchTravelCourses(
          currentPage,
          pageSize,
          selectedRegion,
          allSelectedCities,
          selectedTransportation,
          sortMethod,
          savedOnly
        );

        if (isActive) {
          setCourses(data || []);
          setTotalPages(Math.ceil(count / pageSize));
        }
      } catch (error) {
        console.error("Error loading courses:", error);
        if (isActive) {
          setCourses([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      isActive = false;
    };
  }, [filterKey]); // Use filterKey as dependency

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  }, []);

  if (loading && courses.length === 0) {
    return <ListSkeleton />;
  }

  return (
    <div className="self-stretch flex flex-col items-start justify-start w-full">
      <div className="grid grid-cols-1 w-full">
        {courses.map((course) => (
          <PostItem
            key={course.post_id}
            course={course}
            disableAutoFetch={true} // Add this prop
          />
        ))}
      </div>

      {courses.length > 0 && (
        <div className="w-full flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="w-full text-center py-8">
          <p className="text-gray-500 mb-4">No courses found</p>
          {!savedOnly && (
            <Link
              href="/make"
              className="inline-block px-6 py-2 bg-orangered text-white rounded-full hover:bg-red-600 transition-colors"
            >
              Create New Course
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseList;
