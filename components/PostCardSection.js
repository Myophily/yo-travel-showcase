import React, { useState, useEffect } from "react";
import { getSavedPosts } from "../utils/supabase";
import PostCard from "./PostCard";

const PostCardSection = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSavedPosts();
  }, [page]);

  const loadSavedPosts = async () => {
    try {
      setLoading(true);
      const { data, count, error } = await getSavedPosts(page, 10);

      if (error) {
        if (error.code === "PGRST103") {
          // Range error - no more data
          setHasMore(false);
          return;
        }
        throw error;
      }

      if (data) {
        setSavedPosts((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === 10); // If we got less than 10 items, there's no more data
      }
    } catch (error) {
      console.error("Error loading saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-8 py-4">
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${
            expanded
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex overflow-x-auto pb-4 space-x-4 hide-scrollbar"
          }
        `}
      >
        {savedPosts.map((post) => (
          <div
            key={post.post_id}
            className={`
              ${expanded ? "w-full" : "flex-none w-[280px]"}
              transition-all duration-300
            `}
          >
            <PostCard
              title={post.title}
              tag={post.tags?.[0]}
              imageUrl={post.image_url}
              content={post.content}
              likes={post.likes}
              views={post.views}
              created_at={post.created_at}
              post_id={post.post_id}
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orangered"></div>
        </div>
      )}

      {!loading && savedPosts.length === 0 && (
        <div className="text-center py-8 text-gray-500">게시물이 없습니다.</div>
      )}

      {!loading && hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-mistyrose text-orangered hover:bg-orangered hover:text-white transition-colors duration-300 font-semibold py-2 px-8 rounded-lg"
          >
            더보기
          </button>
        </div>
      )}

      {savedPosts.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-block bg-mistyrose text-orangered hover:bg-orangered hover:text-white transition-colors duration-300 font-semibold py-2 px-8 rounded-lg"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default PostCardSection;
