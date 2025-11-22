import React, { useState } from "react";
import RegionTabs from "../../components/RegionTabs";
import CityTags from "../../components/CityTags";
import CourseList from "../../components/CourseList";
import SelectedCities from "../../components/SelectedCities";
import TransportationTags from "../../components/TransportationTags";
import SortingDropdown from "../../components/SortingDropdown";
import ErrorBoundary from "../../components/ErrorBoundary";

const Courses = () => {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedCities, setSelectedCities] = useState({
    광역시: [],
    경기도: [],
    강원도: [],
    충청도: [],
    전라도: [],
    경상도: [],
  });
  // Initialize with all transportation types selected
  const [selectedTransportation, setSelectedTransportation] = useState([
    "walk",
    "car",
    "public",
    "taxi",
  ]);
  const [sortMethod, setSortMethod] = useState("latest");

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  };

  const handleCitySelect = (city) => {
    setSelectedCities((prev) => ({
      ...prev,
      [selectedRegion]: prev[selectedRegion].includes(city)
        ? prev[selectedRegion].filter((c) => c !== city)
        : [...prev[selectedRegion], city],
    }));
  };

  const handleCityRemove = (region, city) => {
    setSelectedCities((prev) => ({
      ...prev,
      [region]: prev[region].filter((c) => c !== city),
    }));
  };

  const handleTransportationSelect = (transportation) => {
    setSelectedTransportation((prev) =>
      prev.includes(transportation)
        ? prev.filter((t) => t !== transportation)
        : [...prev, transportation]
    );
  };

  const handleSortChange = (method) => {
    setSortMethod(method);
  };

  const allSelectedCities = Object.entries(selectedCities).flatMap(
    ([region, cities]) =>
      cities.map((city) => ({
        parent: region,
        child: city,
      }))
  );

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
        <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
          <a className="[text-decoration:none] relative text-xl leading-[26px] font-semibold text-[inherit]">
            여행코스 게시판
          </a>
          <RegionTabs
            selectedRegion={selectedRegion}
            onRegionSelect={handleRegionSelect}
          />
          {selectedRegion !== "전체" && (
            <CityTags
              selectedRegion={selectedRegion}
              selectedCities={selectedCities[selectedRegion]}
              onCitySelect={handleCitySelect}
            />
          )}
          <SelectedCities
            selectedCities={selectedCities}
            onCityRemove={handleCityRemove}
          />
          <TransportationTags
            selectedTransportation={selectedTransportation}
            onTransportationSelect={handleTransportationSelect}
          />
          <SortingDropdown
            sortMethod={sortMethod}
            onSortChange={handleSortChange}
            pageType="courses"
          />
        </div>
      </section>
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
        <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
          <ErrorBoundary>
            <CourseList
              selectedRegion={selectedRegion}
              selectedCities={selectedCities}
              selectedTransportation={selectedTransportation}
              sortMethod={sortMethod}
              savedOnly={false}
            />
          </ErrorBoundary>
        </div>
      </section>
    </div>
  );
};

export default Courses;
