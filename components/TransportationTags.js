import React from "react";

const TransportationTags = ({
  selectedTransportation,
  onTransportationSelect,
}) => {
  const transportationOptions = ["도보", "자동차", "대중교통", "택시"];

  const getTransportValue = (option) => {
    switch (option) {
      case "도보":
        return "walk";
      case "자동차":
        return "car";
      case "대중교통":
        return "public";
      case "택시":
        return "taxi";
      default:
        return option.toLowerCase();
    }
  };

  const getDisplayName = (value) => {
    switch (value) {
      case "walk":
        return "도보";
      case "car":
        return "자동차";
      case "public":
        return "대중교통";
      case "taxi":
        return "택시";
      default:
        return value;
    }
  };

  return (
    <div className="self-stretch flex flex-col items-end justify-start py-3 px-0 gap-2 text-left">
      <div className="self-stretch flex flex-row flex-wrap items-center justify-start gap-4">
        {transportationOptions.map((option) => {
          const value = getTransportValue(option);
          return (
            <div
              key={option}
              className={`flex-1 rounded-lg ${
                selectedTransportation.includes(value)
                  ? "bg-mistyrose"
                  : "bg-whitesmoke-100"
              } flex flex-row items-center justify-start py-2 px-4 box-border min-w-[101px] cursor-pointer`}
              onClick={() => onTransportationSelect(value)}
            >
              <div className="relative leading-[16px] inline-block min-w-[23px]">
                {option}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransportationTags;
