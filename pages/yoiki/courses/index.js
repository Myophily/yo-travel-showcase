import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import YoikiHeader from "../../../components/YoikiHeader";
import NavigationButtons from "../../../components/NavigationButtons";
import PostCard from "../../../components/PostCard";
import RegionTabs from "../../../components/RegionTabs";
import CityTags from "../../../components/CityTags";
import SelectedCities from "../../../components/SelectedCities";
import { fetchYoikiCourses } from "../../../utils/yoikiSupabase";
import SortingDropdown from "../../../components/SortingDropdown";
import YoikiCategory from "../../../components/YoikiCategory";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Link from "next/link";
import TransportationTags from "../../../components/TransportationTags";

const YoikiCourses = () => {
  const [courses, setCourses] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedCities, setSelectedCities] = useState({
    광역시: [],
    경기도: [],
    강원도: [],
    충청도: [],
    전라도: [],
    경상도: [],
  });
  const [sortMethod, setSortMethod] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState([]);
  // Initialize with all transportation types selected
  const [selectedTransportation, setSelectedTransportation] = useState([
    "walk",
    "car",
    "public",
    "taxi",
  ]);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const loadMoreCourses = async () => {
    if (!hasMore) return;

    // Get all selected cities as a flat array
    const allSelectedCities = Object.values(selectedCities).flat();

    const { data, error } = await fetchYoikiCourses(
      lastTimestamp,
      12,
      selectedRegion,
      allSelectedCities, // Pass the flattened array of cities
      sortMethod,
      selectedCategory,
      selectedTransportation // Pass the selected transportation
    );

    if (error) {
      console.error("Error loading more courses:", error);
      return;
    }

    if (data.length === 0) {
      setHasMore(false);
      return;
    }

    // Add courses to state, ensuring no duplicates
    setCourses((prevCourses) => {
      // Create a Set of existing post_ids
      const existingIds = new Set(prevCourses.map((course) => course.post_id));

      // Filter out any new courses that already exist
      const uniqueNewCourses = data.filter(
        (course) => !existingIds.has(course.post_id)
      );

      // Return the combined array
      return [...prevCourses, ...uniqueNewCourses];
    });

    setLastTimestamp(data[data.length - 1]?.created_at || null);
  };

  useEffect(() => {
    if (inView) {
      loadMoreCourses();
    }
  }, [inView]);

  // Reset courses when filters change
  useEffect(() => {
    setCourses([]);
    setLastTimestamp(null);
    setHasMore(true);
    loadMoreCourses();
  }, [
    selectedRegion,
    selectedCities,
    selectedCategory,
    sortMethod,
    selectedTransportation,
  ]);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setCourses([]);
    setLastTimestamp(null);
    setHasMore(true);
  };

  const handleCitySelect = (city) => {
    if (selectedRegion === "전체") return;

    setSelectedCities((prev) => ({
      ...prev,
      [selectedRegion]: prev[selectedRegion].includes(city)
        ? prev[selectedRegion].filter((c) => c !== city)
        : [...prev[selectedRegion], city],
    }));
    // Reset courses when cities change
    setCourses([]);
    setLastTimestamp(null);
    setHasMore(true);
  };

  const handleCityRemove = (region, city) => {
    setSelectedCities((prev) => ({
      ...prev,
      [region]: prev[region].filter((c) => c !== city),
    }));
    // Reset courses when cities are removed
    setCourses([]);
    setLastTimestamp(null);
    setHasMore(true);
  };

  const handleSortChange = (method) => {
    setSortMethod(method);
    setCourses([]);
    setLastTimestamp(null);
    setHasMore(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((t) => t !== category)
        : [...prev, category]
    );
    setCourses([]);
    setLastTimestamp(null);
    setHasMore(true);
  };

  const handleTransportationSelect = (transportation) => {
    setSelectedTransportation((prev) =>
      prev.includes(transportation)
        ? prev.filter((t) => t !== transportation)
        : [...prev, transportation]
    );
    // Reset courses when transportation changes
    setCourses([]);
    setLastTimestamp(null);
    setHasMore(true);
  };

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start">
      <YoikiHeader />
      <NavigationButtons activePage="/yoiki/courses" />

      <div className="w-full relative bg-white overflow-visible flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
        <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
          <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
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

            <YoikiCategory
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />

            <TransportationTags
              selectedTransportation={selectedTransportation}
              onTransportationSelect={handleTransportationSelect}
            />

            {/* Sorting dropdown in separate container with higher z-index */}
            <div className="relative z-40 w-full">
              <SortingDropdown
                sortMethod={sortMethod}
                onSortChange={handleSortChange}
                pageType="yoiki-courses"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Post grid with lower z-index */}
      <div className="self-stretch grid grid-cols-3 sm:grid-cols-3 gap-2 px-8 py-4 relative">
        {courses.map((course, index) => (
          <Link
            key={`${course.post_id}-${index}`}
            href={`/post/${course.post_id}`}
            className="no-underline"
          >
            <PostCard
              title={course.title}
              imageUrl={course.image_url}
              content={course.content}
              tag={course.tags?.[0]}
              likes={course.likes}
              views={course.views}
              created_at={course.created_at}
              post_id={course.post_id}
            />
          </Link>
        ))}
      </div>

      {hasMore && (
        <div
          ref={ref}
          className="self-stretch h-10 flex items-center justify-center"
        >
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default YoikiCourses;
