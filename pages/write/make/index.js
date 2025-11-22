// ./pages/write/make/index.js

import React, { useState, useEffect } from "react";
import PlaceSearch from "../../../components/PlaceSearch";
import RegionTabs from "../../../components/RegionTabs";
import CityTags from "../../../components/CityTags";
import SelectedCities from "../../../components/SelectedCities";
import { createTravelCourse } from "../../../utils/travelCourseService";
import TravelTypeSelector from "../../../components/TravelTypeSelector";
import { useRouter } from "next/router";
import withAuth from "../../../utils/withAuth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatLocalDate } from "../../../utils/dateUtils";

const MakeTravelPlanPage = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [travelType, setTravelType] = useState("plan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [days, setDays] = useState([]);
  const [completedDays, setCompletedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedCities, setSelectedCities] = useState({
    광역시: [],
    경기도: [],
    강원도: [],
    충청도: [],
    전라도: [],
    경상도: [],
  });

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (Array.isArray(value) && value[0] && value[1]) {
      setStartDate(formatLocalDate(value[0]));
      setEndDate(formatLocalDate(value[1]));
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate + "T00:00:00");
      const end = new Date(endDate + "T00:00:00");
      const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      setDays(
        Array.from({ length: dayCount }, () => ({
          places: [{ name: "", transport: "" }],
        }))
      );
    }
  }, [startDate, endDate]);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  };

  const handleCitySelect = (city) => {
    if (selectedRegion === "전체") return;

    setSelectedCities((prev) => ({
      ...prev,
      [selectedRegion]: Array.isArray(prev[selectedRegion])
        ? prev[selectedRegion].includes(city)
          ? prev[selectedRegion].filter((c) => c !== city)
          : [...prev[selectedRegion], city]
        : [city],
    }));
  };

  const addPlace = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].places.push({ name: "", transport: "" });
    setDays(newDays);
  };

  const handlePlaceSelect = (dayIndex, placeIndex, selectedPlace) => {
    const newDays = [...days];
    newDays[dayIndex].places[placeIndex] = {
      name: selectedPlace.place_name,
      x: selectedPlace.x,
      y: selectedPlace.y,
    };
    setDays(newDays);
  };

  const handleRegisterTrip = async () => {
    if (!courseTitle.trim()) {
      alert("Please enter a course title");
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      alert("Please select travel dates");
      return;
    }

    if (travelType === "plan" && dateRange[0] < new Date()) {
      alert("For future travel plans, please select dates starting from today");
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract only the city names
      const cities = Object.values(selectedCities).flat().filter(Boolean);

      // Filter and validate days data
      const validDays = days
        .map((day) => ({
          ...day,
          places: day.places.filter(
            (place) =>
              place &&
              place.name &&
              place.name.trim() !== "" &&
              place.x &&
              place.y
          ),
        }))
        .filter((day) => day.places.length > 0);

      const courseData = {
        title: courseTitle.trim(),
        travelType,
        selectedCities: cities, // Pass only city array
        startDate,
        endDate,
        days,
      };

      const result = await createTravelCourse(courseData);

      if (result.success) {
        // Store course data and redirect to write page
        localStorage.setItem(
          "selectedCourse",
          JSON.stringify({
            course_id: result.courseId,
            title: courseTitle,
            // ... other relevant data
          })
        );
        router.push("/write");
      } else {
        setError(result.error || "여행 코스 생성 중 오류가 발생했습니다.");
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in handleRegisterTrip:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDayCompletion = (dayIndex) => {
    if (completedDays.includes(dayIndex)) {
      // If already completed, allow modification
      setCompletedDays(completedDays.filter((day) => day !== dayIndex));
    } else {
      // Mark as completed
      setCompletedDays([...completedDays, dayIndex]);
    }
  };

  const handleCityRemove = (region, city) => {
    setSelectedCities((prev) => ({
      ...prev,
      [region]: Array.isArray(prev[region])
        ? prev[region].filter((c) => c !== city)
        : [],
    }));
  };

  return (
    <div className="w-full self-stretch flex flex-col items-start justify-start pt-0 px-8 pb-2.5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-darkslategray">
        여행 계획 만들기
      </h1>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          코스 제목
        </label>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          placeholder="Enter course title"
          required
          className="form-input w-full rounded-lg border-gray-300 focus:border-orangered focus:ring focus:ring-orangered focus:ring-opacity-50 text-sm md:text-base"
        />
      </div>
      <div className="w-full mb-6">
        <TravelTypeSelector
          selectedType={travelType}
          onTypeChange={setTravelType}
        />
        <div className="self-stretch flex flex-col items-start justify-start mb-4 gap-2.5 max-w-full">
          <RegionTabs
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
          />
          {selectedRegion !== "전체" && (
            <CityTags
              selectedRegion={selectedRegion}
              selectedCities={selectedCities[selectedRegion] || []}
              onCitySelect={handleCitySelect}
            />
          )}
          <SelectedCities
            selectedCities={selectedCities}
            onCityRemove={handleCityRemove}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-darkslategray mb-2">
            여행 기간
          </label>
          <Calendar
            onChange={handleDateRangeChange}
            value={dateRange}
            selectRange={true}
            minDate={travelType === "plan" ? new Date() : undefined}
            className="rounded-lg border border-gray-200"
            tileClassName={({ date, view }) =>
              view === "month" && dateRange[0] && dateRange[1]
                ? date >= dateRange[0] && date <= dateRange[1]
                  ? "react-calendar__tile--rangeBetween"
                  : ""
                : ""
            }
          />
          {dateRange[0] && dateRange[1] && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {dateRange[0].toLocaleDateString()} -{" "}
              {dateRange[1].toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {days.map((day, dayIndex) => (
        <div
          key={dayIndex}
          className="mb-8 bg-mistyrose bg-opacity-50 rounded-lg shadow w-full"
        >
          <h2 className="p-4 text-lg md:text-xl font-semibold mb-4 flex items-center text-darkslategray">
            <span className="mr-2 w-6 h-6 flex items-center justify-center bg-orangered text-white rounded-full text-sm">
              {dayIndex + 1}
            </span>
            <span className="text-sm md:text-base">{dayIndex + 1}일차</span>
          </h2>

          <div className="p-4 relative">
            {day.places.map((place, placeIndex) => (
              <div key={placeIndex} className="mb-4 ml-4 relative">
                <div className="absolute left-0 top-0 -ml-6 h-full">
                  <div className="w-4 h-4 rounded-full border-2 border-orangered bg-orangered absolute top-1 left-0"></div>
                  {placeIndex < day.places.length - 1 && (
                    <div className="w-0.5 h-full bg-orangered absolute top-5 left-2"></div>
                  )}
                </div>
                <div className="flex items-center mb-2">
                  <PlaceSearch
                    placeholder={
                      placeIndex === 0 ? "출발지" : `장소 ${placeIndex + 1}`
                    }
                    onPlaceSelect={(selectedPlace) =>
                      handlePlaceSelect(dayIndex, placeIndex, selectedPlace)
                    }
                    disabled={completedDays.includes(dayIndex)}
                    value={place.name}
                  />
                </div>
                {placeIndex < day.places.length - 1 && (
                  <div className="ml-10 mb-2">
                    <select
                      className="form-select w-full text-sm md:text-base border-gray-300 rounded-lg focus:border-orangered focus:ring focus:ring-orangered focus:ring-opacity-50"
                      value={place.transport}
                      onChange={(e) => {
                        const newDays = [...days];
                        newDays[dayIndex].places[placeIndex].transport =
                          e.target.value;
                        setDays(newDays);
                      }}
                      disabled={completedDays.includes(dayIndex)}
                    >
                      <option value="">이동수단 선택</option>
                      <option value="walk">도보</option>
                      <option value="car">자동차</option>
                      <option value="public">대중교통</option>
                      <option value="taxi">택시</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!completedDays.includes(dayIndex) && (
            <button
              className="ml-4 mt-2 flex items-center text-orangered hover:text-red-700 text-sm md:text-base transition-colors"
              onClick={() => addPlace(dayIndex)}
            >
              <span className="w-5 h-5 mr-1 flex items-center justify-center border border-orangered rounded-full">
                +
              </span>
              장소 추가
            </button>
          )}

          <div className="p-4 mt-4 text-right">
            <button
              className={`bg-orangered hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm md:text-base transition-colors ${
                completedDays.includes(dayIndex)
                  ? "bg-blue-500 hover:bg-blue-600"
                  : ""
              }`}
              onClick={() => handleDayCompletion(dayIndex)}
            >
              {completedDays.includes(dayIndex) ? "수정하기" : "완료"}
            </button>
          </div>
        </div>
      ))}

      <div className="text-center w-full mb-8">
        <button
          className="bg-orangered hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full text-sm md:text-lg w-full md:w-auto transition-colors"
          onClick={handleRegisterTrip}
          disabled={isSubmitting}
        >
          {isSubmitting ? "등록 중..." : "여행코스 등록하기"}
        </button>
      </div>
    </div>
  );
};

export default withAuth(MakeTravelPlanPage);
