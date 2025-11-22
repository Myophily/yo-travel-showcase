import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import PostItem from "./PostItem";
import Pagination from "./Pagination";
import ListSkeleton from "./ListSkeleton";

const CommunityList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("category", "Community")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error loading posts:", error);
        return;
      }

      setPosts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error in loadPosts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading && posts.length === 0) {
    return <ListSkeleton />;
  }

  return (
    <div className="self-stretch flex flex-col items-start justify-start">
      {posts.map((post, index) => (
        <PostItem key={`${post.id}-${index}`} course={post} />
      ))}

      <div className="flex justify-center w-full">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalCount / pageSize)}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default CommunityList;
