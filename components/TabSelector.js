import React from "react";

const TabSelector = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="self-stretch rounded-md bg-whitesmoke-300 flex flex-row items-center justify-start p-0.5 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex-1 min-w-[120px] rounded-md flex flex-row items-center justify-center py-2 px-2 sm:px-4 cursor-pointer transition-all duration-200 ${
            activeTab === tab.id
              ? "shadow-[0px_2px_6px_rgba(0,_0,_0,_0.25)] bg-white"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          <h3
            className={`m-0 relative text-sm leading-[16px] font-bold font-inherit truncate ${
              activeTab === tab.id ? "text-darkslategray" : "text-gray-400"
            }`}
          >
            {tab.label}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default TabSelector;
