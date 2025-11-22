import React, { useState, useEffect } from "react";
import Image from "next/image";
import { extractFirstImage, getOptimizedImageUrl } from "../utils/imageUtils";

const PostCard = ({
  title,
  imageUrl,
  tag,
  likes,
  created_at,
  post_id,
  content,
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (content) {
      // Extract image during idle time if possible
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          const extractedImage = extractFirstImage(content);
          setThumbnailUrl(extractedImage);
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          const extractedImage = extractFirstImage(content);
          setThumbnailUrl(extractedImage);
        }, 100);
      }
    }
  }, [content]);

  const optimizedImageUrl = getOptimizedImageUrl(thumbnailUrl || imageUrl, 300);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden bg-white shadow-md">
      <div className="relative pt-[66.67%]">
        {thumbnailUrl?.startsWith("data:") ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute top-0 left-0 w-full h-full object-cover"
            onLoad={() => setIsImageLoading(false)}
          />
        ) : (
          <>
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
            <Image
              src={optimizedImageUrl}
              alt={title}
              layout="fill"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              objectFit="cover"
              className="absolute top-0 left-0 w-full h-full"
              onLoad={() => setIsImageLoading(false)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
                setIsImageLoading(false);
              }}
              priority={false}
              loading="lazy"
            />
          </>
        )}
      </div>
      <div className="p-1 flex flex-col gap-0.5">
        <h3 className="text-xs font-semibold line-clamp-2 min-h-[2rem] text-black">
          {title}
        </h3>
        <div className="flex flex-col gap-1 text-[10px]">
          <span className="bg-mistyrose text-orangered rounded px-1 py-0.5 self-start">
            {tag}
          </span>
          <div className="flex justify-between items-center gap-2 w-full text-gray-600">
            <div className="text-[10px] text-gray-400">
              {new Date(created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-0.5">
              <span>{likes || 0}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="#D9D9D9"
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
      </div>
    </div>
  );
};

export default PostCard;
