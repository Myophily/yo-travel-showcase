import React, { useState, useEffect } from "react";
import PlaceSearch from "../../components/PlaceSearch";
import RegionTabs from "../../components/RegionTabs";
import CityTags from "../../components/CityTags";
import SelectedCities from "../../components/SelectedCities";
import {
  createTravelCourse,
  updateTravelCourse,
} from "../../utils/travelCourseService";
import { supabase } from "../../utils/supabase";
import TravelTypeSelector from "../../components/TravelTypeSelector";
import { useRouter } from "next/router";
import withAuth from "../../utils/withAuth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatLocalDate } from "../../utils/dateUtils";

const MakeTravelPlanPage = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [travelType, setTravelType] = useState("plan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [days, setDays] = useState([]);
  const [completedDays, setCompletedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchCourseForEditing = async () => {
      const { edit } = router.query;
      if (edit) {
        setLoading(true);
        try {
          // Fetch course data
          const { data: courseData, error: courseError } = await supabase
            .from("travel_courses")
            .select("*")
            .eq("course_id", edit)
            .single();

          if (courseError) throw courseError;

          // Set basic course information
          setCourseTitle(courseData.title || "");
          setTravelType(courseData.travel_type || "plan");

          // Parse dates
          if (courseData.start_date && courseData.end_date) {
            const start = new Date(courseData.start_date);
            const end = new Date(courseData.end_date);
            setStartDate(formatLocalDate(start));
            setEndDate(formatLocalDate(end));
            setDateRange([start, end]);
          }

          // Fetch daily courses
          const { data: dailyCourses, error: dailyCoursesError } =
            await supabase
              .from("daily_courses")
              .select("*")
              .eq("travel_course_id", edit)
              .order("day", { ascending: true });

          if (dailyCoursesError) throw dailyCoursesError;

          // Set days data from daily courses
          if (dailyCourses && dailyCourses.length > 0) {
            const formattedDays = dailyCourses.map((day) => {
              return {
                places: day.points.map((point) => ({
                  name: point.name,
                  x: point.x,
                  y: point.y,
                  transport: point.trans || "",
                })),
              };
            });
            setDays(formattedDays);
          }

          // Handle regions/cities if present
          if (courseData.region && Array.isArray(courseData.region)) {
            // This is simplified - in a real implementation you'd need to
            // determine which region each city belongs to
            const regionData = {
              광역시: [],
              경기도: [],
              강원도: [],
              충청도: [],
              전라도: [],
              경상도: [],
            };

            // For this example, I'll just put all cities in their respective regions
            // This would need to be improved with proper region mapping
            courseData.region.forEach((city) => {
              // Very simple check - in real app would need more sophisticated mapping
              if (
                city.includes("서울") ||
                city.includes("부산") ||
                city.includes("인천") ||
                city.includes("대구") ||
                city.includes("대전") ||
                city.includes("광주") ||
                city.includes("울산") ||
                city.includes("세종")
              ) {
                regionData.광역시.push(city);
              } else if (city.includes("경기")) {
                regionData.경기도.push(city);
              } else if (city.includes("강원")) {
                regionData.강원도.push(city);
              } else if (city.includes("충청")) {
                regionData.충청도.push(city);
              } else if (city.includes("전라")) {
                regionData.전라도.push(city);
              } else if (city.includes("경상")) {
                regionData.경상도.push(city);
              }
              // Add more region checks as needed
            });

            setSelectedCities(regionData);
          }
        } catch (error) {
          console.error("Error fetching course for editing:", error);
          alert("여행 코스를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (router.isReady && router.query.edit) {
      fetchCourseForEditing();
    }
  }, [router.isReady, router.query]);

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
        selectedCities, // Pass the entire selectedCities object
        startDate,
        endDate,
        days,
      };

      // Check if we're in edit mode
      const isEditMode = router.query.edit;

      let result;
      if (isEditMode) {
        // Update existing course
        result = await updateTravelCourse(router.query.edit, courseData);
      } else {
        // Create new course
        result = await createTravelCourse(courseData);
      }

      if (result.success) {
        // Store course data and redirect to write page
        alert(
          isEditMode
            ? "여행 코스가 수정되었습니다."
            : "여행 코스가 생성되었습니다."
        );
        router.push(`/saved/courses/${result.courseId}`);
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
        {router.query.edit ? "여행 계획 수정하기" : "여행 계획 만들기"}
      </h1>
      <div className="w-full mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          코스 제목
        </label>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          placeholder="Enter course title"
          required
          className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
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
              여행기간: {dateRange[0].toLocaleDateString()} -{" "}
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
          <h2 className="px-4 text-lg md:text-xl font-semibold flex items-center text-darkslategray">
            <span className="mr-2 w-6 h-6 flex items-center justify-center bg-orangered text-white rounded-full text-sm">
              {dayIndex + 1}
            </span>
            <span className="text-sm md:text-base">{dayIndex + 1}일차</span>
          </h2>

          <div className="mx-4 relative">
            {day.places.map((place, placeIndex) => (
              <div key={placeIndex} className="mb-4 ml-4 relative ">
                <div className="absolute left-0 top-0 -ml-6 h-full">
                  <div className="w-4 h-4 rounded-full border-2 border-orangered bg-orangered absolute top-1 left-0"></div>
                  {placeIndex < day.places.length - 1 && (
                    <div className="w-0.5 h-full bg-orangered absolute top-5 left-2"></div>
                  )}
                </div>
                <div className="flex items-center mb-2 ">
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
                      className="p-2 form-select w-full text-sm md:text-base border-gray-300 rounded-lg focus:border-orangered focus:ring focus:ring-orangered focus:ring-opacity-50"
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

          <div className="px-4 pb-4 text-right">
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

      <button
        onClick={handleRegisterTrip}
        disabled={isSubmitting}
        className="w-full bg-orangered text-white py-3 px-5 rounded-lg font-bold text-base md:text-lg hover:bg-red-600 transition-colors"
      >
        {isSubmitting
          ? "처리 중..."
          : router.query.edit
          ? "여행 코스 수정하기"
          : "여행 코스 등록하기"}
      </button>
    </div>
  );
};

export default withAuth(MakeTravelPlanPage);
