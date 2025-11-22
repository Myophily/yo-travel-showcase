import React, { useState, useEffect } from "react";
import PostItem from "./PostItem";
import { getRelatedPosts } from "../utils/supabase";
import Link from "next/link";
import ListSkeleton from "./ListSkeleton";

const RelatedCourses = ({ post }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedPosts = async () => {
      setLoading(true);
      const posts = await getRelatedPosts(post);
      setRelatedPosts(posts);
      setLoading(false);
    };

    if (post?.post_id) {
      loadRelatedPosts();
    }
  }, [post]);

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <section className="w-full self-stretch bg-white flex flex-col items-center justify-start py-[30px] px-0 gap-[30px] text-left text-5xl text-darkslategray-200 font-open-sans">
      <div className="w-full self-stretch flex flex-col items-start justify-start">
        <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
        {relatedPosts.length > 0 ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.post_id}
                href={`/post/${relatedPost.post_id}`}
                className="no-underline"
              >
                <PostItem course={relatedPost} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">연관 게시물이 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default RelatedCourses;
