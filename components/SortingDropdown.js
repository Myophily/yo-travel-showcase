import React, { useState } from "react";

const SortingDropdown = ({ sortMethod, onSortChange, pageType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSortOptions = () => {
    const commonOptions = [
      { value: "latest", label: "최신순" },
      { value: "likes", label: "좋아요 많은 순" },
      { value: "saves", label: "저장 많은 순" },
    ];

    switch (pageType) {
      case "courses":
      case "yoiki-courses":
        return [
          ...commonOptions,
          { value: "reviews", label: "리뷰 많은 순" },
          { value: "anticipated", label: "기대 많은 순" },
        ];
      case "community":
        return commonOptions;
      default:
        return commonOptions;
    }
  };

  const sortOptions = getSortOptions();

  const handleSort = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      {" "}
      {/* Added z-50 for highest priority */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-mistyrose text-orangered hover:bg-orangered hover:text-white transition-colors duration-300 font-semibold py-2 px-4 rounded-full inline-flex items-center"
      >
        <span className="mr-2">
          {sortOptions.find((option) => option.value === sortMethod)?.label}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          {" "}
          {/* Added z-50 */}
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {sortOptions.map((option) => (
              <a
                key={option.value}
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  handleSort(option.value);
                }}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingDropdown;
