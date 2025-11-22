import React, { useState, useEffect, useRef } from "react";

const PlaceSearch = ({ onPlaceSelect, placeholder, disabled, value }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchInputRef = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_APP_KEY}&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        placesService.current = new window.kakao.maps.services.Places();
        setIsLoaded(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "" || !isLoaded) return;

    setIsSearching(true);
    if (placesService.current) {
      placesService.current.keywordSearch(searchTerm, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(result);
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
      });
    } else {
      console.error("Places service is not initialized");
      setIsSearching(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setSearchTerm(place.place_name);
    setSearchResults([]);
    onPlaceSelect(place);
  };

  return (
    <div className="relative w-full me-4">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`p-2 form-input w-full rounded-lg border-gray-300 focus:border-orangered focus:ring focus:ring-orangered focus:ring-opacity-50 text-sm md:text-base ${
            disabled ? "bg-gray-100" : ""
          }`}
        />
      </form>
      {isSearching && (
        <div className="mt-2 text-sm text-gray-600">검색 중...</div>
      )}
      {!isLoaded && (
        <div className="mt-2 text-sm text-gray-600">지도 서비스 로딩 중...</div>
      )}
      {searchResults.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((place) => (
            <li
              key={place.id}
              onClick={() => handlePlaceSelect(place)}
              className="p-2 hover:bg-mistyrose cursor-pointer transition-colors duration-150 ease-in-out"
            >
              <div className="font-semibold text-darkslategray">
                {place.place_name}
              </div>
              <div className="text-sm text-gray-600">{place.address_name}</div>
              <div className="text-xs text-gray-500">{place.category_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceSearch;
