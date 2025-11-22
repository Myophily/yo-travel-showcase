import { supabase } from "./supabase";

export const fetchComments = async (postId, type) => {
  try {
    // First fetch comments
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("comment_type", type)
      .order("created_at", { ascending: false });

    if (commentsError) throw commentsError;

    // If we have comments, fetch the associated user profiles
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map((comment) => comment.user_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from("user_profile")
        .select("user_id, name, profile_picture_url")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const commentsWithProfiles = comments.map((comment) => ({
        ...comment,
        profiles:
          profiles?.find((profile) => profile.user_id === comment.user_id) ||
          null,
      }));

      return { data: commentsWithProfiles, count: comments.length };
    }

    return { data: comments, count: comments?.length || 0 };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { data: [], count: 0 };
  }
};

export const addComment = async (postId, content, type) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Not authenticated");

    // First create the comment
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        comment_type: type,
      })
      .select()
      .single();

    if (commentError) throw commentError;

    // Then get the user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("user_id, name, profile_picture_url")
      .eq("user_id", user.id)
      .single();

    if (profileError) throw profileError;

    // Combine the data
    return {
      data: {
        ...comment,
        profiles: profile,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { data: null, error };
  }
};

export const deleteComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { error };
  }
};

export const likeComment = async (commentId) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .update({ likes: supabase.raw("likes + 1") })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error liking comment:", error);
    return { data: null, error };
  }
};
