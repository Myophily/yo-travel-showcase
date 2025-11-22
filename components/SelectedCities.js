import React from "react";

const SelectedCities = ({ selectedCities, onCityRemove }) => {
  const cities = Object.entries(selectedCities)
    .filter(([_, cities]) => cities && cities.length > 0)
    .map(([region, cities]) => ({ region, cities }));

  if (cities.length === 0) return null;

  return (
    <div className="flex flex-row items-start justify-start gap-2.5 text-orangered flex-wrap">
      {cities.map(({ region, cities }) =>
        cities.map((city) => (
          <div
            key={`${region}-${city}`}
            className="rounded bg-mistyrose flex flex-row items-end justify-start p-1 gap-1"
          >
            <div className="relative font-semibold inline-block min-w-[29px]">
              {region}
              {">"}
              {city}
            </div>
            <button
              onClick={() => onCityRemove(region, city)}
              className="text-orangered hover:text-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SelectedCities;
