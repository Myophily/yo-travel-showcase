import React from "react";
import CourseList from "./CourseList";
import Pagination from "./Pagination";

const MainContent = () => {
  return (
    <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
      <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
        <CourseList />
        <div className="self-stretch flex flex-col items-start justify-start gap-12 text-xs text-grey-400">
          <Pagination />
        </div>
      </div>
    </section>
  );
};

export default MainContent;
