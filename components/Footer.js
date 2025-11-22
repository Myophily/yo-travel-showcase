import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const Footer = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [rightOffset, setRightOffset] = useState(4); // default padding
  const router = useRouter();

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setIsPopupOpen(false); // Close the popup on route change
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  const getIconColor = (path) => {
    return router.pathname === path ? "#FF3C26" : "#FFE4E1";
  };

  const isYoikiPath = router.pathname.startsWith("/yoiki");

  useEffect(() => {
    const calculateOffset = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth >= 768) {
        // Calculate the distance from the right edge of the viewport to the container edge
        const offset = (windowWidth - 768) / 2 + 16; // 16px is the desired padding
        setRightOffset(offset);
      } else {
        setRightOffset(16); // Default padding on mobile
      }
    };

    // Initial calculation
    calculateOffset();

    // Recalculate on window resize
    window.addEventListener("resize", calculateOffset);
    return () => window.removeEventListener("resize", calculateOffset);
  }, []);

  const fabStyle = {
    right: `${rightOffset}px`,
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div
        className="fixed bottom-20 flex flex-col items-end space-y-4 z-50"
        style={fabStyle}
      >
        {/* Pop-up buttons */}
        {isPopupOpen && (
          <div className="flex flex-col space-y-4">
            <Link
              href="/write"
              className="w-12 h-12 bg-orangered rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
            >
              <img
                className="w-4 h-4 object-contain text-white"
                src="/pencil-icon.svg"
                alt="Write Post"
              />
            </Link>
            <Link
              href="/make"
              className="w-12 h-12 bg-orangered rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
            >
              <img
                className="w-4 h-4 object-contain text-white"
                src="/line-icon.svg"
                alt="Courses"
              />
            </Link>
          </div>
        )}
        {/* Main button */}
        <button
          onClick={togglePopup}
          className="w-14 h-14 bg-orangered rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none"
        >
          <img
            className="w-5 h-5 object-contain text-white"
            src="/+.svg"
            alt="Add"
          />
        </button>
      </div>

      {/* Floating Tab Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-40">
        <div className="max-w-[768px] min-w-[320px] mx-auto px-4">
          <nav className="shadow-lg rounded-full bg-white flex flex-row items-center justify-between py-3 px-6">
            <Link href="/" className="tab-item">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14 20.1483L21.21 24.5L19.2967 16.2983L25.6667 10.78L17.2783 10.0683L14 2.33331L10.7217 10.0683L2.33333 10.78L8.70333 16.2983L6.79 24.5L14 20.1483Z"
                  fill={getIconColor("/")}
                />
              </svg>
            </Link>
            <Link href="/courses" className="tab-item">
              <svg
                width="29"
                height="28"
                viewBox="0 0 29 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.6667 17.7099V8.1666C22.6667 5.58827 20.5783 3.49994 18 3.49994C15.4217 3.49994 13.3333 5.58827 13.3333 8.1666V19.8332C13.3333 21.1166 12.2833 22.1666 11 22.1666C9.71667 22.1666 8.66667 21.1166 8.66667 19.8332V10.2899C10.02 9.79993 11 8.5166 11 6.99994C11 5.06327 9.43667 3.49994 7.5 3.49994C5.56333 3.49994 4 5.06327 4 6.99994C4 8.5166 4.98 9.79993 6.33333 10.2899V19.8332C6.33333 22.4116 8.42167 24.5 11 24.5C13.5783 24.5 15.6667 22.4116 15.6667 19.8332V8.1666C15.6667 6.88327 16.7167 5.83327 18 5.83327C19.2833 5.83327 20.3333 6.88327 20.3333 8.1666V17.7099C18.7292 18.2782 17.7676 19.9193 18.0558 21.5965C18.3443 23.274 19.7986 24.5 21.5 24.5C23.4367 24.5 25 22.9366 25 21C25 19.4833 24.02 18.1999 22.6667 17.7099ZM7.5 8.1666C6.85833 8.1666 6.33333 7.64161 6.33333 6.99994C6.33333 6.35827 6.85833 5.83327 7.5 5.83327C8.14167 5.83327 8.66667 6.35827 8.66667 6.99994C8.66667 7.64161 8.14167 8.1666 7.5 8.1666ZM21.5 22.1666C20.8583 22.1666 20.3333 21.6416 20.3333 21C20.3333 20.3582 20.8583 19.8332 21.5 19.8332C22.1417 19.8332 22.6667 20.3582 22.6667 21C22.6667 21.6416 22.1417 22.1666 21.5 22.1666Z"
                  fill={getIconColor("/courses")}
                />
              </svg>
            </Link>
            <Link href="/yoiki/community" className="tab-item">
              <div
                className={`w-6 h-6 rounded-full ${
                  isYoikiPath ? "bg-orangered" : "bg-mistyrose"
                }`}
              ></div>
            </Link>
            <Link href="/saved" className="tab-item">
              <svg
                width="29"
                height="28"
                viewBox="0 0 29 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20.3334 3.5H8.66671C7.38337 3.5 6.33337 4.55 6.33337 5.83333V24.5L14.5 21L22.6667 24.5V5.83333C22.6667 4.55 21.6167 3.5 20.3334 3.5ZM20.3334 21L14.5 18.4567L8.66671 21V5.83333H20.3334V21Z"
                  fill={getIconColor("/saved")}
                />
              </svg>
            </Link>
            <Link href="/profile" className="tab-item">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.2422 13.8633C17.0312 13.8633 19.3047 11.3789 19.3047 8.35547C19.3047 5.35547 17.043 3 14.2422 3C11.4648 3 9.17969 5.40234 9.17969 8.37891C9.19141 11.3906 11.4531 13.8633 14.2422 13.8633ZM14.2422 12.0938C12.5312 12.0938 11.0664 10.4531 11.0664 8.37891C11.0664 6.33984 12.5078 4.76953 14.2422 4.76953C15.9883 4.76953 17.418 6.31641 17.418 8.35547C17.418 10.4297 15.9648 12.0938 14.2422 12.0938ZM6.87109 24.7031H21.6016C23.5469 24.7031 24.4727 24.1172 24.4727 22.8281C24.4727 19.7578 20.5938 15.3164 14.2422 15.3164C7.87891 15.3164 4 19.7578 4 22.8281C4 24.1172 4.92578 24.7031 6.87109 24.7031ZM6.32031 22.9336C6.01562 22.9336 5.88672 22.8516 5.88672 22.6055C5.88672 20.6836 8.86328 17.0859 14.2422 17.0859C19.6094 17.0859 22.5859 20.6836 22.5859 22.6055C22.5859 22.8516 22.4688 22.9336 22.1641 22.9336H6.32031Z"
                  fill={getIconColor("/profile")}
                />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Footer;
