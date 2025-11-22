import { memo } from "react";
import PropTypes from "prop-types";
import YoutubeSection from "./YoutubeSection";

const YoikiHeader = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-2.5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans ${className}`}
    >
      <div className="self-stretch flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
        <YoutubeSection youtubeUrl="https://www.youtube.com/watch?v=4CXtw3zLyd0" />
        <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-[inherit] inline-block min-w-[100px]">
          가요이
        </h1>
      </div>
    </section>
  );
});

YoikiHeader.propTypes = {
  className: PropTypes.string,
};

export default YoikiHeader;
