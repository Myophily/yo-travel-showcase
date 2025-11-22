import React, { useState } from "react";
import BestList from "../components/BestList";
import BestPosts from "../components/BestPosts";
import HallOfFameItem from "../components/HallOfFameItem";
import { supabase, calculateBestScore } from "../utils/supabase";

const Home = ({ initialHallOfFame, topPosts }) => {
  const [hallOfFame, setHallOfFame] = useState(initialHallOfFame);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <BestPosts initialTopPosts={topPosts} />
      <section className="self-stretch flex flex-col items-start justify-start pt-0 px-8 pb-4 box-border max-w-full">
        <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray mb-2.5">
          명예의 전당
        </h1>
        {hallOfFame.length > 0 ? (
          <div className="w-full">
            {hallOfFame.map((post, index) => (
              <React.Fragment key={post.post_id}>
                <HallOfFameItem post={post} index={index} />
                {index < hallOfFame.length - 1 && (
                  <div className="self-stretch border-b-[0.5px] border-solid border-gainsboro-100" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-sm text-darkslategray">
            표시할 게시물이 없습니다.
          </p>
        )}
      </section>
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
        <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
          <BestList
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            setTotalPages={setTotalPages}
            hallOfFamePosts={hallOfFame}
            initialBestPosts={topPosts}
          />
        </div>
      </section>
    </div>
  );
};

// Add server-side rendering
export async function getServerSideProps() {
  try {
    // Fetch Hall of Fame posts
    const { data: posts } = await supabase
      .from("posts")
      .select("post_id, title, likes, saved_count, created_at")
      .eq("category", "Travel Courses")
      .order("likes", { ascending: false })
      .limit(20);

    const hallOfFamePosts = posts
      ? posts
          .map((post) => ({
            ...post,
            bestScore: calculateBestScore(post),
          }))
          .sort((a, b) => b.bestScore - a.bestScore)
          .slice(0, 5)
      : [];

    // Fetch recent top posts
    const oneWeekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: topPosts } = await supabase
      .from("posts")
      .select("post_id, title, likes, saved_count, created_at")
      .eq("category", "Community")
      .gte("created_at", oneWeekAgo)
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      props: {
        initialHallOfFame: hallOfFamePosts,
        topPosts: topPosts || [],
      },
    };
  } catch (error) {
    console.error("Server-side fetch error:", error);
    return {
      props: {
        initialHallOfFame: [],
        topPosts: [],
      },
    };
  }
}

export default Home;