import React from "react";
import Link from "next/link";

const SavedCoursesHeader = () => {
  return (
    <>
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
        <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
          <h1 className="m-0 relative text-xl leading-[26px] font-semibold text-darkslategray">
            저장된 게시물
          </h1>
        </div>
      </section>
      <div className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-2.5 box-border max-w-full">
        <Link
          href="/saved/courses"
          className="flex-1 shadow-[0px_2px_10px_rgba(0,_0,_0,_0.15)] rounded-lg bg-white hover:bg-mistyrose transition-colors duration-300 flex flex-row flex-wrap items-start justify-start p-3 box-border gap-[33.3px] max-w-full"
        >
          <div className="flex-1 flex flex-row items-center justify-start gap-1 min-w-[171px]">
            <img
              className="h-4 w-4 relative overflow-hidden shrink-0 object-cover min-h-[16px]"
              alt=""
              src="/ictwotoneroute-1@2x.png"
            />
            <div className="relative leading-[16px] text-darkslategray font-semibold">
              저장된 코스
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default SavedCoursesHeader;
