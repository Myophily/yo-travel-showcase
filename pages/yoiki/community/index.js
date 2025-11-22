import React from "react";
import YoikiHeader from "../../../components/YoikiHeader";
import NavigationButtons from "../../../components/NavigationButtons";
import CommunityList from "../../../components/CommunityList";
import TopPosts from "../../../components/TopPosts";

const YoikiCommunity = () => {
  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <YoikiHeader />
      <NavigationButtons activePage="/yoiki/community" />
      <TopPosts />

      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
        <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
          <CommunityList />
        </div>
      </section>
    </div>
  );
};

export default YoikiCommunity;
