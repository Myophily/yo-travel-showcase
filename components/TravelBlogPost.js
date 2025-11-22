import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import TurndownService from "turndown";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";
import {
  checkPostLike,
  togglePostLike,
  getCurrentUser,
  updatePost,
  deletePost,
} from "../utils/supabase";
import SaveButton from "./SaveButton";
import YoutubeSection from "./YoutubeSection";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import PathUI from "./PathUI";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
});

const TravelBlogPost = ({ post, authorProfile, dailyCourses = [] }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedTags, setEditedTags] = useState(post.tags || []);
  const router = useRouter();
  const [saveCount, setSaveCount] = useState(post.saved_count || 0);
  const handleSaveToggle = (newSaveStatus) => {
    setSaveCount((prev) => (newSaveStatus ? prev + 1 : prev - 1));
  };
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  const [sanitizedContent, setSanitizedContent] = useState("");

  const contentMarkdown = turndownService.turndown(post.content || "");

  useEffect(() => {
    checkUser();
    checkInitialLikeStatus();
  }, [post.post_id]);

  useEffect(() => {
    const initializeDOMPurify = async () => {
      if (typeof window !== "undefined") {
        try {
          const DOMPurify = (await import("dompurify")).default;
          const clean = DOMPurify(window).sanitize(post.content || "", {
            ADD_TAGS: ["img"],
            ADD_ATTR: ["src", "alt", "style"],
          });
          setSanitizedContent(clean);
        } catch (error) {
          console.error("Error initializing DOMPurify:", error);
          // Fallback to unsanitized content in case of error
          setSanitizedContent(post.content || "");
        }
      }
    };

    initializeDOMPurify();
  }, [post.content]);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const checkInitialLikeStatus = async () => {
    const liked = await checkPostLike(post.post_id);
    setIsLiked(liked);
  };

  const handleLikeClick = async () => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const newLikeStatus = await togglePostLike(post.post_id);
      setIsLiked(newLikeStatus);
      setLikeCount((prev) => (newLikeStatus ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error toggling like:", error);
      // Show user-friendly error message
      if (error.message === "User not authenticated") {
        router.push("/login");
      } else {
        // You might want to add a toast notification system for error messages
        alert("Failed to update like status. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Add Quill modules config
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const createSanitizedMarkup = (content) => {
    const window = new JSDOM("").window;
    const DOMPurify = createDOMPurify(window);

    const sanitizedContent = DOMPurify.sanitize(content, {
      ADD_TAGS: ["img"],
      ADD_ATTR: ["src", "alt", "style"],
    });
    return { __html: sanitizedContent };
  };

  const handleEditClick = () => {
    router.push(`/write?edit=${post.post_id}`);
  };

  return (
    <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[10.2px] box-border max-w-full text-left text-xs text-systemblack font-inter">
      <div className="self-stretch flex-1 rounded-lg bg-white flex flex-col items-start justify-start py-2 box-border gap-2.5 max-w-full">
        <h1 className="m-0 self-stretch text-2xl font-semibold text-darkslategray-200">
          {post.title}
        </h1>

        {/* Author info and upload date */}
        <div className="w-full flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src={
                  authorProfile?.profile_picture_url || "/default-avatar.png"
                }
                alt={authorProfile?.name || "Anonymous"}
                layout="fill"
                sizes="(max-width: 768px) 32px, 32px"
                className="rounded-full object-cover"
              />
            </div>
            <span className="font-medium">
              {authorProfile?.name || "Anonymous"}
            </span>
          </div>
          <span>
            Uploaded on: {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        <YoutubeSection youtubeUrl={post.youtube_url} />
        {/* Travel Course Path and Map */}
        {post.category === "Travel Courses" && dailyCourses.length > 0 && (
          <div className="w-full space-y-4 my-4">
            {dailyCourses.map((day, index) => (
              <div key={index} className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-orangered text-white flex items-center justify-center text-xs mr-2">
                    {index + 1}
                  </span>
                  Day {index + 1}
                </h3>
                {day.points && day.points.length > 0 && (
                  <>
                    <div className="mb-4">
                      <PathUI places={day.points} />
                    </div>
                    <div className="h-[300px] rounded-lg overflow-hidden">
                      <TripMap places={day.points} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Replace the content section */}
        <div className="self-stretch rounded-lg bg-whitesmoke-100 flex flex-col items-start justify-start py-2.5 px-3 box-border">
          <div className="w-full max-w-none">
            <div
              className="w-full max-w-none prose prose-sm sm:prose lg:prose-lg prose-headings:text-darkslategray prose-p:text-darkslategray prose-img:rounded-lg prose-img:my-4"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </div>
        <TagList tags={post.tags} />
        <div className="w-full flex items-center justify-end gap-2">
          {/* Only show SaveButton for non-Community posts */}
          {post.category !== "Community" && (
            <span>
              <SaveButton
                postId={post.post_id}
                savedCount={saveCount}
                onSaveToggle={handleSaveToggle}
              />
            </span>
          )}
          <button
            onClick={handleLikeClick}
            disabled={loading}
            className="flex items-center gap-1 cursor-pointer border-none bg-transparent p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 14 14"
              fill={isLiked ? "#FF3C26" : "#D9D9D9"}
              xmlns="http://www.w3.org/2000/svg"
              className="transition-colors duration-200"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.99999 12.7042L6.15416 11.9342C3.14999 9.21 1.16666 7.41333 1.16666 5.20833C1.16666 3.41167 2.57832 2 4.37499 2C5.38999 2 6.36416 2.4725 6.99999 3.21917C7.63582 2.4725 8.60999 2 9.62499 2C11.4217 2 12.8333 3.41167 12.8333 5.20833C12.8333 7.41333 10.85 9.21 7.84582 11.94L6.99999 12.7042Z"
              />
            </svg>
            <span>{likeCount}</span>
          </button>
        </div>
        {user && user.id === post.user_id && (
          <div className="w-full flex justify-end gap-2 mt-4">
            <button
              onClick={handleEditClick}
              className="px-4 py-2 text-sm bg-mistyrose text-orangered rounded-lg hover:bg-orangered hover:text-white transition-colors"
            >
              수정
            </button>
            <button
              onClick={async () => {
                if (
                  window.confirm("Are you sure you want to delete this post?")
                ) {
                  const { error } = await deletePost(post.post_id);
                  if (!error) {
                    router.push("/");
                  } else {
                    alert("Failed to delete post. Please try again.");
                    console.error("Error deleting post:", error);
                  }
                }
              }}
              className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const TagList = ({ tags }) => {
  return (
    <div className="flex flex-row items-center justify-start gap-2.5 text-3xs text-orangered font-open-sans">
      {tags &&
        tags.map((tag, index) => (
          <div
            key={index}
            className="rounded bg-mistyrose flex flex-row items-center justify-center p-0.5"
          >
            <div className="relative leading-[10px] font-semibold inline-block min-w-[30px]">
              #{tag}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TravelBlogPost;
