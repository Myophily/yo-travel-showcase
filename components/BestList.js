import React, { useState, useEffect } from "react";
import { supabase, calculateBestScore } from "../utils/supabase";
import PostItem from "./PostItem";
import ListSkeleton from "./ListSkeleton";

const BestList = ({ hallOfFamePosts }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestPosts();
  }, [hallOfFamePosts]);

  const fetchBestPosts = async () => {
    setLoading(true);

    // Get the post_ids of Hall of Fame posts
    const hallOfFameIds = hallOfFamePosts.map((post) => post.post_id);

    const oneWeekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .not("category", "is", null)
      .not("post_id", "in", `(${hallOfFameIds.join(",")})`)
      .gte("created_at", oneWeekAgo)
      .order("created_at", { ascending: false })
      .limit(20); // Limit to 20 posts

    if (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      return;
    }

    const postsWithBestScore = data.map((post) => ({
      ...post,
      best: calculateBestScore(post),
    }));

    postsWithBestScore.sort((a, b) => b.best - a.best);

    setPosts(postsWithBestScore);
    setLoading(false);
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="self-stretch flex flex-col items-start justify-start w-full">
      <h2 className="text-xl font-semibold mb-4">인기 게시물</h2>
      {posts.map((post) => (
        <PostItem key={post.post_id} course={post} />
      ))}
    </div>
  );
};

export default BestList;
