import React from "react";

const TravelCourseHeader = () => {
  return (
    <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
      <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
        <a className="[text-decoration:none] relative text-xl leading-[26px] font-semibold text-[inherit]">
          여행 코스 게시판
        </a>
      </div>
    </section>
  );
};

export default TravelCourseHeader;
