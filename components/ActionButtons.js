import React from "react";

const ActionButtons = () => (
  <div className="self-stretch flex flex-row items-start justify-start gap-2.5">
    <button className="cursor-pointer [border:none] py-1.5 px-[37px] bg-orangered rounded-lg flex flex-row items-start justify-start whitespace-nowrap">
      <div className="relative text-sm leading-[20px] font-semibold font-open-sans text-mistyrose whitespace-pre-wrap text-left inline-block min-w-[84px]">
        새로 만들기 +
      </div>
    </button>
    <button className="cursor-pointer [border:none] py-1.5 px-[42px] bg-orangered rounded-lg flex flex-row items-start justify-start whitespace-nowrap">
      <div className="relative text-sm leading-[20px] font-semibold font-open-sans text-mistyrose text-left inline-block min-w-[73px]">
        불러오기 📂
      </div>
    </button>
  </div>
);

export default ActionButtons;