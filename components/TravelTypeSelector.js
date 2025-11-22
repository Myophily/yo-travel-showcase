import React from "react";

const TravelTypeSelector = ({ selectedType, onTypeChange }) => {
  return (
    <div className="self-stretch rounded-md bg-whitesmoke-300 flex flex-row items-center justify-start p-0.5 [row-gap:20px]">
      <div
        className={`flex-1 rounded-md flex flex-row items-center justify-center py-2 px-[39px] whitespace-nowrap cursor-pointer ${
          selectedType === "plan"
            ? "shadow-[0px_2px_6px_rgba(0,_0,_0,_0.25)] bg-white"
            : ""
        }`}
        onClick={() => onTypeChange("plan")}
      >
        <h3
          className={`m-0 relative text-inherit leading-[16px] font-bold font-[inherit] inline-block min-w-[70px] ${
            selectedType === "plan" ? "text-darkslategray" : "text-gray-400"
          }`}
        >
          여행 갈 곳
        </h3>
      </div>
      <div
        className={`flex-1 rounded-md flex flex-row items-center justify-center py-2 px-[39px] whitespace-nowrap cursor-pointer ${
          selectedType === "review"
            ? "shadow-[0px_2px_6px_rgba(0,_0,_0,_0.25)] bg-white"
            : ""
        }`}
        onClick={() => onTypeChange("review")}
      >
        <h3
          className={`m-0 relative text-inherit leading-[16px] font-bold font-[inherit] inline-block min-w-[70px] ${
            selectedType === "review" ? "text-darkslategray" : "text-gray-400"
          }`}
        >
          여행 갔다 온 곳
        </h3>
      </div>
    </div>
  );
};

export default TravelTypeSelector;
