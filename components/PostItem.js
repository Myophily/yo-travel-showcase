import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { checkPostLike, togglePostLike, supabase } from "../utils/supabase";
import { extractFirstImage } from "../utils/imageUtils";

const PostItem = ({ course, disableAutoFetch = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(course.likes || 0);
  const [viewCount, setViewCount] = useState(course.views || 0);
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const initializeComponent = async () => {
      try {
        // Only fetch if not disabled
        if (!disableAutoFetch) {
          const liked = await checkPostLike(course.post_id);
          if (isMounted) setIsLiked(liked);

          if (course.user_id) {
            const { data, error } = await supabase
              .from("user_profile")
              .select("name, profile_picture_url")
              .eq("user_id", course.user_id)
              .single();

            if (!error && data && isMounted) {
              setAuthorProfile(data);
            }
          }
        }

        // Always process content for thumbnail
        if (course.content) {
          const extractedImage = extractFirstImage(course.content);
          if (isMounted) setThumbnailUrl(extractedImage);
        }
      } catch (error) {
        console.error("Error in initializeComponent:", error);
      }
    };

    initializeComponent();

    return () => {
      isMounted = false;
    };
  }, [course.post_id, course.content, course.user_id, disableAutoFetch]);

  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/post/${course.post_id}`);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    try {
      setLoading(true);
      const newLikeStatus = await togglePostLike(course.post_id);
      setIsLiked(newLikeStatus);
      setLikeCount((prev) =>
        newLikeStatus ? prev + 1 : Math.max(0, prev - 1)
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  const fallbackImageUrl = "/placeholder-image.jpg";

  const isValidImageUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname !== "example.com";
    } catch {
      return false;
    }
  };

  const imageSrc =
    thumbnailUrl ||
    (course.image_url && isValidImageUrl(course.image_url)
      ? course.image_url
      : fallbackImageUrl);

  return (
    <div
      onClick={handleClick}
      className="self-stretch border-grey-400 border-b-[0.2px] border-solid flex flex-row flex-wrap items-start justify-start pt-2.5 px-0 pb-[9px] gap-2.5 shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="h-[50px] w-[50px] relative rounded-lg overflow-hidden">
        {thumbnailUrl?.startsWith("data:") ? (
          <img
            src={thumbnailUrl}
            alt={course.title || "Post image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={imageSrc}
            alt={course.title || "Post image"}
            fill
            sizes="(max-width: 768px) 50px, 50px"
            className="object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImageUrl;
            }}
          />
        )}
      </div>
      <div className="flex-1 flex flex-col items-start justify-start gap-1 min-w-[173px]">
        <h2 className="mt-0 mb-0 mr-4 self-stretch relative text-sm leading-[16px] font-semibold font-[inherit] text-black line-clamp-1">
          {course.title}
        </h2>

        {/* Tags Section */}
        <div className="flex flex-row items-start justify-start gap-2.5 text-orangered overflow-hidden whitespace-nowrap">
          {course.tags?.map((tag, index) => (
            <div
              key={index}
              className="rounded bg-mistyrose flex-shrink-0 flex flex-row items-start justify-start py-[0.5px] px-0.5"
            >
              <div className="relative font-semibold inline-block">#{tag}</div>
            </div>
          ))}
          {course.region?.map((region, index) => (
            <div
              key={`region-${index}`}
              className="rounded bg-transparent flex flex-row items-start justify-start py-[0.5px] px-0.5"
            >
              <div className="relative text-transparent font-medium inline-block">
                {region}
              </div>
            </div>
          ))}
        </div>

        {/* Metadata Section */}
        <div className="self-stretch flex flex-row items-center justify-between text-grey-400 text-xs">
          <div className="flex items-center gap-4">
            {authorProfile && (
              <span className="font-medium">{authorProfile.name}</span>
            )}
            <span>{formatDate(course.created_at)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>조회수</span>
              <span>{viewCount}</span>
            </div>

            <button
              onClick={handleLikeClick}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity bg-transparent"
              disabled={loading}
            >
              <span>{likeCount}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill={isLiked ? "#FF3C26" : "#D9D9D9"}
                xmlns="http://www.w3.org/2000/svg"
                className="transition-colors duration-200"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.99999 12.7042L6.15416 11.9342C3.14999 9.21 1.16666 7.41333 1.16666 5.20833C1.16666 3.41167 2.57832 2 4.37499 2C5.38999 2 6.36416 2.4725 6.99999 3.21917C7.63582 2.4725 8.60999 2 9.62499 2C11.4217 2 12.8333 3.41167 12.8333 5.20833C12.8333 7.41333 10.85 9.21 7.84582 11.94L6.99999 12.7042Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
