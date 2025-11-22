import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PostItem from "../components/PostItem";
import { searchContent } from "../utils/supabase";
import Pagination from "../components/Pagination";
import ListSkeleton from "../components/ListSkeleton";
import SearchBar from "../components/SearchBar";

const SearchPage = () => {
  const router = useRouter();
  const { q: searchQuery } = router.query;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (router.isReady && searchQuery) {
      loadSearchResults();
    }
  }, [router.isReady, searchQuery, currentPage]);

  const loadSearchResults = async () => {
    setLoading(true);
    const { data, count, error } = await searchContent(searchQuery, {
      page: currentPage,
      pageSize,
    });

    if (!error) {
      setResults(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } else {
      console.error("Error searching content:", error);
      setResults([]);
      setTotalPages(0);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
          <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray">
            Search Results
          </h1>
          <div className="w-full">
            {searchQuery && (
              <p className="text-sm text-gray-600 m-0">
                Results for:{" "}
                <span className="font-semibold">{searchQuery}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
        <div className="flex-1 flex flex-col items-start justify-start max-w-full">
          {loading ? (
            <ListSkeleton />
          ) : results.length > 0 ? (
            <>
              {results.map((post) => (
                <PostItem key={post.post_id} course={post} />
              ))}
              {totalPages > 1 && (
                <div className="w-full flex justify-center mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center w-full py-8">
              <p className="text-gray-500">
                No results found for "{searchQuery}"
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Try using different keywords or check your spelling
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchPage;
