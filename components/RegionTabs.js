import React from "react";

const RegionTabs = ({ selectedRegion, onRegionSelect }) => {
  const regions = [
    "전체",
    "광역시",
    "경기도",
    "강원도",
    "충청도",
    "전라도",
    "경상도",
  ];

  return (
    <div className="self-stretch rounded-lg flex flex-col items-start justify-start text-center text-gray-200">
      <div className="self-stretch border-gainsboro-100 border-b-[0.5px] border-solid overflow-x-auto">
        <div className="flex flex-row flex-nowrap items-start justify-start gap-2">
          {regions.map((region) => (
            <div
              key={region}
              className={`flex-none flex flex-col items-center justify-center pt-2 px-1 pb-[7px] gap-1 cursor-pointer ${
                selectedRegion === region ? "border-b-2 border-gray-200" : ""
              }`}
              onClick={() => onRegionSelect(region)}
            >
              <h3
                className={`m-0 relative text-inherit leading-[16px] font-${
                  selectedRegion === region ? "bold" : "normal"
                } font-[inherit] inline-block min-w-[23px]`}
              >
                {region}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionTabs;
