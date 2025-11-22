import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, calculateBestScore, checkPostLike } from "../utils/supabase";

const LikeIcon = ({ post, index }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      const liked = await checkPostLike(post.post_id);
      setIsLiked(liked);
    };
    checkLikeStatus();
  }, [post.post_id]);

  return (
    <div className="flex items-center">
      <span className="mr-0.5">{post.likes || 0}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill={isLiked ? "#FF3C26" : "#D9D9D9"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.99999 12.7042L6.15416 11.9342C3.14999 9.21 1.16666 7.41333 1.16666 5.20833C1.16666 3.41167 2.57832 2 4.37499 2C5.38999 2 6.36416 2.4725 6.99999 3.21917C7.63582 2.4725 8.60999 2 9.62499 2C11.4217 2 12.8333 3.41167 12.8333 5.20833C12.8333 7.41333 10.85 9.21 7.84582 11.94L6.99999 12.7042Z"
        />
      </svg>
    </div>
  );
};

const TopPosts = () => {
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    fetchTopPosts();
  }, []);

  const fetchTopPosts = async () => {
    const oneWeekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("category", "Community")
      .gte("created_at", oneWeekAgo)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching top posts:", error);
    } else {
      const postsWithScore = data.map((post) => ({
        ...post,
        bestScore: calculateBestScore(post),
      }));
      const sortedPosts = postsWithScore
        .sort((a, b) => b.bestScore - a.bestScore)
        .slice(0, 5);
      setTopPosts(sortedPosts);
    }
  };

  return (
    <section className="self-stretch flex flex-col items-start justify-start pt-0 px-8 pb-4 box-border max-w-full">
      <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray mb-2.5">
        최신 인기 게시물
      </h1>
      {topPosts.length > 0 ? (
        <div className="w-full">
          {topPosts.map((post, index) => (
            <Link
              key={post.post_id}
              href={`/post/${post.post_id}`}
              className="block no-underline text-inherit"
            >
              <div className="flex items-center justify-between py-2.5 px-0">
                <div className="flex items-center">
                  <span className="text-orangered font-semibold mr-2">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-darkslategray line-clamp-1 mr-4">
                    {post.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-5 text-xs text-grey-400">
                  <span className="flex items-center gap-0.5">
                    {post.saved_count}
                    <svg
                      width="12"
                      height="14"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M20.3334 3.5H8.66671C7.38337 3.5 6.33337 4.55 6.33337 5.83333V24.5L14.5 21L22.6667 24.5V5.83333C22.6667 4.55 21.6167 3.5 20.3334 3.5ZM20.3334 21L14.5 18.4567L8.66671 21V5.83333H20.3334V21Z"
                        fill="#D9D9D9"
                      />
                    </svg>
                  </span>
                  <LikeIcon post={post} index={index} />
                </div>
              </div>
              {index < topPosts.length - 1 && (
                <div className="self-stretch border-b-[0.5px] border-solid border-gainsboro-100" />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-darkslategray">
          최신 인기 게시물이 없습니다.
        </p>
      )}
    </section>
  );
};

export default TopPosts;
