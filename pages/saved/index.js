import React, { useState, useEffect } from "react";
import Link from "next/link";
import SavedCoursesHeader from "../../components/SavedCoursesHeader";
import PostCard from "../../components/PostCard";
import PostItem from "../../components/PostItem";
import { getSavedPosts } from "../../utils/supabase";
import withAuth from "../../utils/withAuth";
import Pagination from "../../components/Pagination";
import LoadingSpinner from "../../components/LoadingSpinner";

const Saved = () => {
  const [savedPosts, setSavedPosts] = useState({ yoiki: [], regular: [] });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadSavedPosts();
  }, [currentPage]);

  const loadSavedPosts = async () => {
    try {
      setLoading(true);
      const { data, count, error } = await getSavedPosts(currentPage, pageSize);
      if (error) throw error;

      // Separate yoiki and regular posts
      const yoikiPosts = data.filter((post) => post.yoiki === true);
      const regularPosts = data.filter((post) => post.yoiki === false);

      setSavedPosts({
        yoiki: yoikiPosts,
        regular: regularPosts,
      });
      setTotalPages(Math.ceil(count / pageSize));
    } catch (error) {
      console.error("Error loading saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading && !savedPosts.yoiki.length && !savedPosts.regular.length) {
    return (
      <div className="w-full relative bg-white min-h-screen">
        <SavedCoursesHeader />
        <div className="flex justify-center items-center h-[50vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <SavedCoursesHeader />

      {savedPosts.yoiki.length > 0 && (
        <section className="w-full px-8 py-4">
          <h2 className="text-xl font-semibold text-darkslategray mb-4">
            가요이 코스
          </h2>
          <div className="relative">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex flex-nowrap gap-4 pb-4">
                {savedPosts.yoiki.map((post) => (
                  <div key={post.post_id} className="flex-none w-[120px]">
                    <Link href={`/post/${post.post_id}`}>
                      <PostCard
                        title={post.title}
                        imageUrl={post.image_url}
                        content={post.content}
                        tag={post.tags?.[0]}
                        likes={post.likes}
                        views={post.views}
                        created_at={post.created_at}
                        post_id={post.post_id}
                      />
                    </Link>
                  </div>
                ))}
                <div className="w-[140px]">
                  <div className="w-[140px]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {savedPosts.regular.length > 0 && (
        <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
          <div className="self-stretch flex flex-col items-start justify-start w-full">
            <h2 className="text-xl font-semibold mb-4">저장된 게시물</h2>
            <div className="flex flex-col w-full">
              {loading ? (
                <div className="w-full flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                savedPosts.regular.map((post) => (
                  <PostItem key={post.post_id} course={post} />
                ))
              )}
            </div>
            {!loading && totalPages > 1 && (
              <div className="w-full flex justify-center mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {!loading &&
        savedPosts.yoiki.length === 0 &&
        savedPosts.regular.length === 0 && (
          <div className="w-full text-center py-16">
            <p className="text-gray-500">아직 저장된 게시물이 없어요!</p>
          </div>
        )}
    </div>
  );
};

export default withAuth(Saved);
