import React, { useState, useEffect } from "react";
import Link from "next/link";
import { checkPostLike } from "../utils/supabase";

const HallOfFameItem = ({ post, index }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      const liked = await checkPostLike(post.post_id);
      setIsLiked(liked);
    };
    checkLikeStatus();
  }, [post.post_id]);

  return (
    <Link
      href={`/post/${post.post_id}`}
      className="block no-underline text-inherit"
    >
      <div className="flex items-center justify-between py-2.5 px-0">
        <div className="flex items-center">
          <span className="text-orangered font-semibold mr-2">{index + 1}</span>
          <h3 className="text-sm font-semibold text-darkslategray truncate mr-4">
            {post.title}
          </h3>
        </div>
        <div className="flex items-center space-x-5 text-xs text-grey-400">
          <span>
            {post.saved_count}{" "}
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
        </div>
      </div>
    </Link>
  );
};

export default HallOfFameItem;
