import React from "react";

const CityTags = ({ selectedRegion, selectedCities, onCitySelect }) => {
  const cityMap = {
    광역시: [
      "서울",
      "부산",
      "인천",
      "대구",
      "대전",
      "광주",
      "울산",
      "세종",
      "제주",
    ],
    경기도: ["경기북부", "경기남부"],
    강원도: ["강원북부", "강원남부"],
    충청도: ["충청북도", "충청남도"],
    전라도: ["전라북도", "전라남도"],
    경상도: ["경상북도", "경상남도"],
  };

  if (selectedRegion === "전체" || !cityMap[selectedRegion]) return null;

  return (
    <div className="self-stretch flex flex-col items-end justify-start py-3 px-0 gap-2 text-left">
      <div className="self-stretch flex flex-row flex-wrap items-center justify-start gap-4">
        {cityMap[selectedRegion].map((city) => (
          <div
            key={city}
            onClick={() => onCitySelect(city)}
            className={`flex-1 rounded-lg cursor-pointer transition-all duration-200 ${
              Array.isArray(selectedCities) && selectedCities.includes(city)
                ? "bg-mistyrose"
                : "bg-whitesmoke-100"
            } flex flex-row items-center justify-start py-2 px-4 box-border min-w-[101px]`}
          >
            <div className="relative leading-[16px] inline-block min-w-[23px]">
              {city}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityTags;