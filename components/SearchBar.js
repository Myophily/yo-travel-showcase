import React, { useState } from "react";
import { useRouter } from "next/router";

const SearchBar = ({ className = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`self-stretch rounded-lg bg-whitesmoke-300 flex flex-row items-center justify-between py-1.5 px-3 text-sm text-lightslategray ${className}`}
    >
      <div className="flex-1 flex flex-row items-center justify-start py-0 px-0 box-border gap-2 min-w-0">
        <img
          className="h-5 w-5 flex-shrink-0 relative object-cover min-h-[20px]"
          loading="lazy"
          alt="Search"
          src="/icon--android--24--search@2x.png"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full min-w-0 relative text-inherit leading-[20px] font-normal font-[inherit] bg-transparent border-none outline-none"
        />
      </div>
      <div className="h-[17px] w-px mx-2 flex-shrink-0 relative border-gainsboro-200 border-r-[1px] border-solid box-border" />
      <button
        type="submit"
        className="border-none bg-transparent cursor-pointer flex-shrink-0 relative leading-[20px] text-dimgray hover:text-orangered transition-colors whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
