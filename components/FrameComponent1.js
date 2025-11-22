import { memo } from "react";
import Alert1 from "./Alert1";
import PropTypes from "prop-types";

const FrameComponent1 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch h-[322px] flex flex-row items-start justify-start pt-0 px-8 pb-2.5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans ${className}`}
    >
      <div className="self-stretch flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
        <div className="self-stretch flex-1 rounded-lg bg-gainsboro-200 flex flex-row items-start justify-center py-[70px] px-5 box-border max-w-full">
          <div className="h-[180px] w-[326px] relative rounded-lg bg-gainsboro-200 hidden max-w-full" />
          <img
            className="h-10 w-10 relative rounded object-contain z-[1]"
            loading="lazy"
            alt=""
            src="/polygon-1.svg"
          />
        </div>
        <Alert1 />
        <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-[inherit] inline-block min-w-[100px]">
          Best Posts
        </h1>
        <div className="flex flex-row items-start justify-start gap-2 text-center text-sm text-orangered">
          <button className="cursor-pointer [border:none] py-2 px-[27px] bg-orangered rounded-981xl flex flex-row items-start justify-start">
            <div className="relative text-sm leading-[20px] font-semibold font-open-sans text-mistyrose text-center inline-block min-w-[18px]">
              All
            </div>
          </button>
          <button className="cursor-pointer [border:none] p-2 bg-mistyrose rounded-981xl flex flex-row items-start justify-start">
            <div className="relative text-sm leading-[20px] font-semibold font-open-sans text-orangered text-center inline-block min-w-[55px]">
              Courses
            </div>
          </button>
          <div className="rounded-981xl bg-mistyrose flex flex-row items-start justify-start py-2 px-[25px]">
            <h2 className="m-0 relative text-inherit leading-[20px] font-semibold font-[inherit] inline-block min-w-[21px]">
              Yo!
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
});

FrameComponent1.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent1;
