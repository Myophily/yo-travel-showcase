import React from "react";
import Link from "next/link";

const NavigationButton = ({ href, text, active }) => (
  <Link href={href} className="no-underline">
    {" "}
    {/* Ensure no underline on Link */}
    <button
      className={`cursor-pointer [border:none] p-2 ${
        active ? "bg-orangered" : "bg-mistyrose"
      } rounded-981xl flex flex-row items-start justify-start shrink-0`}
    >
      <div
        className={`relative text-sm leading-[20px] font-semibold font-open-sans ${
          active ? "text-mistyrose" : "text-orangered"
        } text-center inline-block min-w-[55px]`}
      >
        {text}
      </div>
    </button>
  </Link>
);

const NavigationButtons = ({ activePage }) => {
  const buttons = [
    { href: "/yoiki/community", text: "자유게시판" },
    { href: "/yoiki/announcement", text: "공지사항" },
    { href: "/yoiki/courses", text: "가요이코스" },
    { href: "/yoiki/schedule", text: "가요이 일정" },
  ];

  return (
    <div className="w-full max-w-screen-lg mx-8 overflow-x-auto">
      {" "}
      {/* Increased margin */}
      <div className="flex flex-row items-start justify-start pt-0 px-0 pb-2 gap-2 text-center text-sm text-orangered min-w-max">
        {buttons.map((button) => (
          <NavigationButton
            key={button.href}
            href={button.href}
            text={button.text}
            active={activePage === button.href}
          />
        ))}
        <div className="w-[100px]">
          <div className="w-[100px]"></div>
        </div>
      </div>
    </div>
  );
};

export default NavigationButtons;
