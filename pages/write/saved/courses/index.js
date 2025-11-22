import React, { useState } from "react";
import WriteCourseList from "../../../../components/WriteCourseList";
import TravelTypeSelector from "../../../../components/TravelTypeSelector";
import withAuth from "../../../../utils/withAuth";

const SavedCoursesPage = () => {
  const [selectedType, setSelectedType] = useState("all");

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  return (
    <div className="w-full self-stretch flex flex-col items-start justify-start pt-0 px-8 pb-2.5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
      <section className="self-stretch flex flex-row items-start justify-start pt-0 pb-5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
        <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
          <h1 className="m-0 relative text-xl leading-[26px] font-semibold text-darkslategray">
            Saved
          </h1>
        </div>
      </section>
      <div className="w-full mb-6">
        <TravelTypeSelector
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
        />
      </div>
      <section className="self-stretch flex flex-row items-start justify-start pt-0 pb-[26px] box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
          <WriteCourseList travelType={selectedType} />
        </div>
      </section>
    </div>
  );
};

export default withAuth(SavedCoursesPage);
