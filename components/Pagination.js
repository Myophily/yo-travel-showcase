import React from "react";
import Link from "next/link";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="Pagination"
    >
      <Link href="#" passHref>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-2 py-1 rounded-md bg-mistyrose text-orangered hover:bg-orangered hover:text-white transition-colors"
          disabled={currentPage === 1}
        >
          &lt;
        </button>
      </Link>
      {pages.map((page) => (
        <Link key={page} href="#" passHref>
          <button
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page
                ? "bg-orangered text-white"
                : "bg-mistyrose text-orangered hover:bg-orangered hover:text-white"
            } transition-colors`}
          >
            {page}
          </button>
        </Link>
      ))}
      <Link href="#" passHref>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-2 py-1 rounded-md bg-mistyrose text-orangered hover:bg-orangered hover:text-white transition-colors"
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </Link>
    </nav>
  );
};

export default Pagination;
