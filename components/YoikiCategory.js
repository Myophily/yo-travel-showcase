import React from "react";

const YoikiCategory = ({ selectedCategory, onCategorySelect }) => {
  const CategoryOptions = [
    "시즌1",
    "시즌2",
    "시즌3",
    "시즌4",
    "당일취기",
    "데이트",
    "여행",
  ];

  return (
    <div className="self-stretch flex flex-col items-end justify-start py-3 px-0 gap-2 text-left">
      <div className="self-stretch flex flex-row flex-wrap items-center justify-start gap-4">
        {CategoryOptions.map((option) => (
          <div
            key={option}
            className={`flex-1 rounded-lg ${
              selectedCategory.includes(option)
                ? "bg-mistyrose"
                : "bg-whitesmoke-100"
            } flex flex-row items-center justify-start py-2 px-4 box-border min-w-[101px] cursor-pointer`}
            onClick={() => onCategorySelect(option)}
          >
            <div className="relative leading-[16px] inline-block min-w-[23px]">
              {option}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YoikiCategory;
