import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import TabSelector from "./TabSelector";
import {
  fetchComments,
  addComment,
  deleteComment,
  likeComment,
} from "../utils/commentService";
import { getCurrentUser } from "../utils/supabase";
import LoadingSpinner from "./LoadingSpinner";

const CommentSection = ({ postId }) => {
  const [activeTab, setActiveTab] = useState("want_to_go");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadComments();
    checkUser();
  }, [postId, activeTab]);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const loadComments = async () => {
    setLoading(true);
    const { data } = await fetchComments(postId, activeTab);
    setComments(data || []);
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await addComment(
        postId,
        newComment.trim(),
        activeTab
      );
      if (!error && data) {
        setComments([data, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaChange = (e) => {
    setNewComment(e.target.value);
    // Auto-adjust height
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleLike = async (commentId) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const { data } = await likeComment(commentId);
    if (data) {
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        )
      );
    }
  };

  return (
    <section className="self-stretch flex flex-row items-start justify-start pt-0 px-4 sm:px-8 pb-[11px] box-border max-w-full text-center text-xs text-gray-200 font-open-sans">
      <div className="flex-1 flex flex-col items-start justify-start gap-[11px] max-w-full">
        <div className="self-stretch rounded-lg bg-white flex flex-col items-start justify-start p-3 gap-2.5">
          <TabSelector
            tabs={[
              { id: "want_to_go", label: "가보고 싶어요" },
              { id: "been_there", label: "가봤어요" },
            ]}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <form onSubmit={handleSubmitComment} className="w-full">
            <textarea
              className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter text-sm text-darkslategray-200 min-w-[181px] resize-none min-h-[100px]"
              placeholder={
                user ? "Add a comment..." : "Please login to comment"
              }
              value={newComment}
              onChange={handleTextareaChange}
              disabled={!user || isSubmitting}
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!user || isSubmitting || !newComment.trim()}
                className="cursor-pointer [border:none] py-2 px-4 bg-mistyrose rounded-lg flex flex-row items-start justify-center"
              >
                <div className="relative text-sm font-inter text-orangered text-left inline-block">
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </div>
              </button>
            </div>
          </form>

          {loading ? (
            <div className="w-full justify-center items-center flex">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="self-stretch rounded-lg flex flex-col items-start justify-start gap-4 text-left text-darkslateblue">
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onLike={() => handleLike(comment.id)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Comment = ({ comment, onLike, currentUserId }) => {
  const canDelete = currentUserId === comment.user_id;

  return (
    <div className="self-stretch flex flex-row flex-wrap items-start justify-start gap-2.5">
      <Image
        width={48}
        height={48}
        className="rounded-full object-cover"
        src={comment.profiles?.profile_picture_url || "/default-avatar.png"}
        alt={comment.profiles?.name}
      />
      <div className="flex-1 flex flex-col items-start justify-between pt-0 px-0 pb-0 box-border gap-[9px] min-w-[159px]">
        <h3 className="m-0 self-stretch relative text-inherit font-bold font-[inherit]">
          {comment.profiles?.name || "Anonymous"}
        </h3>
        <h3 className="m-0 self-stretch relative text-inherit leading-[16.3px] font-normal font-[inherit] text-systemblack">
          {comment.content}
        </h3>
        <div className="w-full flex flex-row items-center justify-end text-cornflowerblue">
          <span className="text-gray-400 text-sm">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
