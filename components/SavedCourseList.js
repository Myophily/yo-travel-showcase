import React, { useState, useEffect } from "react";
import Link from "next/link";
import PostItem from "./PostItem";
import { getUserCreatedCourses } from "../utils/supabase";
import ListSkeleton from "./ListSkeleton";

const SavedCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadCourses();
  }, [page]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data, count, error } = await getUserCreatedCourses(
        page,
        pageSize
      );

      if (error) {
        console.error("Error loading courses:", error);
        return;
      }

      if (page === 1) {
        setCourses(data || []);
      } else {
        setCourses((prevCourses) => [...prevCourses, ...(data || [])]);
      }
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error in loadCourses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (courses.length < totalCount) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [courses.length, totalCount]);

  if (loading && courses.length === 0) {
    return <ListSkeleton />;
  }

  if (!loading && courses.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-4">
          <p className="text-gray-500 text-lg">게시물이 없습니다.</p>
          <p className="text-gray-400 text-sm">당신의 코스를 저장하세요!</p>
          <Link
            href="/make"
            className="inline-block mt-4 px-6 py-2 bg-orangered text-white rounded-full hover:bg-red-600 transition-colors text-sm"
          >
            코스 만들기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="self-stretch flex flex-col items-start justify-start w-full">
      <div className="grid grid-cols-1 gap-4 w-full">
        {courses.map((course) => (
          <Link
            key={course.post_id}
            href={`/post/${course.post_id}`}
            className="no-underline w-full"
          >
            <PostItem
              course={course}
              className={
                loading ? "opacity-60 animate-pulse pointer-events-none" : ""
              }
            />
          </Link>
        ))}
      </div>

      {loading && courses.length > 0 && (
        <div className="w-full flex justify-center py-4">
          <div className="animate-pulse w-8 h-8 rounded-full bg-mistyrose"></div>
        </div>
      )}

      {!loading && courses.length < totalCount && (
        <div className="w-full flex justify-center py-4">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2 bg-mistyrose text-orangered rounded-full hover:bg-orangered hover:text-white transition-colors text-sm"
          >
            더보기
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedCourseList;
