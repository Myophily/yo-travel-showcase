import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import YoutubeSection from "./YoutubeSection";
import Alert1 from "./Alert1";
import { fetchAnnouncements } from "../utils/supabaseAnnouncements";

const BestPosts = ({ initialTopPosts = [], className = "" }) => {
  const [recentAnnouncement, setRecentAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentAnnouncement();
  }, []);

  const loadRecentAnnouncement = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await fetchAnnouncements(1, 1);
      if (!error && data && data.length > 0) {
        setRecentAnnouncement(data[0]);
      }
    } catch (error) {
      console.error("Error loading announcement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className={`self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-2.5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans ${className}`}
    >
      <div className="self-stretch flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
        <YoutubeSection youtubeUrl="https://www.youtube.com/watch?v=4CXtw3zLyd0" />
        {!isLoading && recentAnnouncement && (
          <Alert1 announcement={recentAnnouncement} />
        )}
      </div>
    </section>
  );
};

BestPosts.propTypes = {
  className: PropTypes.string,
  initialTopPosts: PropTypes.array,
};

export default BestPosts;
