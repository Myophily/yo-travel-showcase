import React from "react";

const ListSkeleton = () => {
  return (
    <div className="w-full space-y-0">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="self-stretch border-grey-400 border-b-[0.2px] border-solid flex flex-row flex-wrap items-start justify-start pt-2.5 px-0 pb-[9px] gap-2.5 shrink-0 animate-pulse"
        >
          {/* Thumbnail Skeleton */}
          <div className="h-[50px] w-[50px] bg-zinc-200 rounded-lg"></div>

          {/* Content Container */}
          <div className="flex-1 flex flex-col items-start justify-start gap-1 min-w-[173px]">
            {/* Title Skeleton */}
            <div className="w-3/4 h-4 bg-zinc-200 rounded"></div>

            {/* Tags Skeleton */}
            <div className="flex flex-row items-start justify-start gap-2.5">
              <div className="w-16 h-[18px] bg-zinc-100 rounded"></div>
              <div className="w-16 h-[18px] bg-zinc-100 rounded"></div>
            </div>

            {/* Metadata Skeleton */}
            <div className="self-stretch flex flex-row items-start justify-between">
              {/* Date */}
              <div className="w-24 h-3.5 rounded"></div>

              {/* Stats */}
              <div className="flex flex-row items-start justify-start gap-5">
                {/* Likes */}
                <div className="flex flex-row items-start justify-start gap-0.5">
                  <div className="w-8 h-3.5 bg-zinc-200 rounded"></div>
                  <div className="w-4 h-3.5 bg-zinc-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
