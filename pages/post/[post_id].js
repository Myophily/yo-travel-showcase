import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabase";
import TravelBlogPost from "../../components/TravelBlogPost";
import CommentSection from "../../components/CommentSection";
import RelatedCourses from "../../components/RelatedCourses";
import ErrorBoundary from "../../components/ErrorBoundary";
import LoadingSpinner from "../../components/LoadingSpinner";

const PostDetail = () => {
  const router = useRouter();
  const { post_id } = router.query;
  const [post, setPost] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [dailyCourses, setDailyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (router.isReady && post_id) {
      fetchPost(post_id);
      subscribeToLikes(post_id);

      // Add subscription for post updates
      const subscription = supabase
        .channel(`post_${post_id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "posts",
            filter: `post_id=eq.${post_id}`,
          },
          (payload) => {
            fetchPost(post_id);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [router.isReady, post_id]);

  const fetchPost = async (postId) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch post data
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (postError) throw postError;
      setPost(postData);

      // Fetch author profile
      if (postData.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from("user_profile")
          .select("*")
          .eq("user_id", postData.user_id)
          .single();

        if (!profileError) {
          setAuthorProfile(profileData);
        }
      }

      // Fetch daily courses if this is a Travel Course
      if (postData.category === "Travel Courses" && postData.travel_course_id) {
        const { data: coursesData, error: coursesError } = await supabase
          .from("daily_courses")
          .select("*")
          .eq("travel_course_id", postData.travel_course_id)
          .order("day", { ascending: true });

        if (!coursesError && coursesData) {
          setDailyCourses(coursesData);
        }
      } else {
        setDailyCourses([]); // Reset if not a travel course
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Failed to fetch post. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLikes = (postId) => {
    const subscription = supabase
      .channel(`post_${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchPost(postId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchPost(postId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal] text-left text-xl text-darkslategray-200 font-open-sans">
      <ErrorBoundary>
        <TravelBlogPost
          post={post}
          authorProfile={authorProfile}
          dailyCourses={dailyCourses}
        />
        <CommentSection postId={post.post_id} />
        <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
          <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
            <RelatedCourses post={post} />
          </div>
        </section>
      </ErrorBoundary>
    </div>
  );
};

export default PostDetail;
