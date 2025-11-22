import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const signInWithApple = () =>
  supabase.auth.signInWithOAuth({ provider: "apple" });
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: "google" });
export const signInWithKakao = () =>
  supabase.auth.signInWithOAuth({ provider: "kakao" });
export const signOut = () => supabase.auth.signOut();

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

const cache = {
  data: new Map(),
  ttl: new Map(),
  set: function (key, data, ttlMs = 60000) {
    this.data.set(key, data);
    this.ttl.set(key, Date.now() + ttlMs);
  },
  get: function (key) {
    if (!this.data.has(key)) return null;
    if (Date.now() > this.ttl.get(key)) {
      this.data.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.data.get(key);
  },
  clear: function () {
    this.data.clear();
    this.ttl.clear();
  },
};

export const fetchPostsOptimized = async (options = {}) => {
  const {
    category = null,
    page = 1,
    pageSize = 10,
    sortBy = "created_at",
    sortDirection = "desc",
    fields = "post_id,title,likes,saved_count,created_at,tags",
    cacheKey = null,
    cacheTtl = 60000, // 1 minute cache by default
  } = options;

  // Try to get from cache first
  if (cacheKey) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;
  }

  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("posts").select(fields, { count: "exact" });

    if (category) {
      query = query.eq("category", category);
    }

    // Handle sorting
    query = query.order(sortBy, { ascending: sortDirection === "asc" });

    // Add pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const result = { data, count, error: null };

    // Cache the result if cacheKey is provided
    if (cacheKey) {
      cache.set(cacheKey, result, cacheTtl);
    }

    return result;
  } catch (error) {
    console.error(`Error in fetchPostsOptimized: ${error.message}`);
    return { data: [], count: 0, error };
  }
};

export const fetchTravelCoursesOptimized = async (
  page = 1,
  pageSize = 10,
  selectedRegion = "전체",
  selectedCities = [],
  selectedTransportation = [],
  sortMethod = "latest",
  savedOnly = false,
  cacheKey = null
) => {
  // Try to get from cache first
  if (cacheKey) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;
  }

  try {
    // Only select the fields we actually need
    let query = supabase
      .from("posts")
      .select(
        "post_id, title, image_url, content, tags, likes, views, created_at, saved_count, region, transportation",
        { count: "exact" }
      )
      .eq("category", "Travel Courses");

    // Add city filtering
    if (selectedCities && selectedCities.length > 0) {
      query = query.overlaps("region", selectedCities);
    }

    // Add transportation filtering
    if (selectedTransportation && selectedTransportation.length > 0) {
      query = query.overlaps("transportation", selectedTransportation);
    }

    // Sorting
    switch (sortMethod) {
      case "likes":
        query = query.order("likes", { ascending: false });
        break;
      case "saves":
        query = query.order("saved_count", { ascending: false });
        break;
      case "reviews":
        query = query.order("been_there_count", { ascending: false });
        break;
      case "anticipated":
        query = query.order("want_to_go_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const result = { data: data || [], count: count || 0, error: null };

    // Cache the result if cacheKey is provided
    if (cacheKey) {
      cache.set(cacheKey, result, 30000); // 30 second cache
    }

    return result;
  } catch (error) {
    console.error("Error fetching travel courses:", error);
    return {
      data: [],
      count: 0,
      error,
    };
  }
};

// Function to clear cache (use when data is mutated)
export const clearCache = () => {
  cache.clear();
};

export const fetchTravelCourses = async (
  page = 1,
  pageSize = 10,
  selectedRegion = "전체",
  selectedCities = [],
  selectedTransportation = [],
  sortMethod = "latest",
  savedOnly = false
) => {
  try {
    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("category", "Travel Courses");

    // Add city filtering
    if (selectedCities && selectedCities.length > 0) {
      query = query.overlaps("region", selectedCities);
    }

    // Add transportation filtering
    if (selectedTransportation && selectedTransportation.length > 0) {
      // First, get all posts with any of the selected transportation types
      query = query.overlaps("transportation", selectedTransportation);
    }

    switch (sortMethod) {
      case "likes":
        query = query.order("likes", { ascending: false });
        break;
      case "saves":
        query = query.order("saved_count", { ascending: false });
        break;
      case "reviews":
        query = query.order("been_there_count", { ascending: false });
        break;
      case "anticipated":
        query = query.order("want_to_go_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    let { data, error, count } = await query;

    if (error) throw error;

    // Client-side filtering to remove posts with transportation types that are not in the selected list
    if (selectedTransportation && selectedTransportation.length > 0) {
      const allTransportation = ["walk", "car", "public", "taxi"];
      const unselectedTransportation = allTransportation.filter(
        (type) => !selectedTransportation.includes(type)
      );

      data = data.filter((post) => {
        if (!post.transportation || !Array.isArray(post.transportation))
          return true;

        // Check if post has any unselected transportation types
        return !post.transportation.some((type) =>
          unselectedTransportation.includes(type)
        );
      });

      count = data.length; // Update count after filtering
    }

    return {
      data: data || [],
      count: count || 0,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching travel courses:", error);
    return {
      data: [],
      count: 0,
      error: error,
    };
  }
};

export const fetchCommunityPosts = async (
  page = 1,
  pageSize = 20,
  sortMethod = "latest"
) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("category", "Community")
      .range(from, to);

    switch (sortMethod) {
      case "likes":
        query = query.order("likes", { ascending: false });
        break;
      case "saves":
        query = query.order("saved_count", { ascending: false });
        break;
      case "comments":
        query = query.order("comment_count", { ascending: false });
        break;
      case "reviews":
        query = query.order("been_there_count", { ascending: false });
        break;
      case "anticipated":
        query = query.order("want_to_go_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
    const { data, error, count } = await query;

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return { data: null, count: 0, error };
  }
};

export const fetchScheduleEvents = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .select("*")
      .gte("start_time", startDate)
      .lte("end_time", endDate)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching schedule events:", error);
    return { data: null, error };
  }
};

export const createScheduleEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .insert([eventData])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating schedule event:", error);
    return { data: null, error };
  }
};

export const calculateBestScore = (post) => {
  const score = (4 * post.likes + 6 * post.saved_count) / 10;
  return score;
};

export const checkPostLike = async (postId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error checking post like:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking post like:", error);
    return false;
  }
};

export const togglePostLike = async (postId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const isLiked = await checkPostLike(postId);

    if (isLiked) {
      // Remove like
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Decrease post like count using the function
      const { error: decrementError } = await supabase.rpc(
        "decrement_post_likes",
        {
          post_id_param: postId,
        }
      );

      if (decrementError) throw decrementError;

      return false;
    } else {
      // Add like
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });

      if (insertError) throw insertError;

      // Increase post like count using the function
      const { error: incrementError } = await supabase.rpc(
        "increment_post_likes",
        {
          post_id_param: postId,
        }
      );

      if (incrementError) throw incrementError;

      return true;
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
};

export const isUserAdmin = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("user_profile")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.is_admin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const getRelatedPosts = async (currentPost, limit = 4) => {
  try {
    // Get posts from the same category
    let query = supabase
      .from("posts")
      .select("*")
      .eq("category", currentPost.category)
      .neq("post_id", currentPost.post_id)
      .limit(limit * 2); // Get more posts than needed for filtering

    // If post has regions, include them in query
    if (currentPost.region && currentPost.region.length > 0) {
      query = query.overlaps("region", currentPost.region);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    // Calculate relevance score for each post
    const scoredPosts = posts.map((post) => {
      let score = 0;

      // Score based on tags similarity
      const commonTags =
        post.tags?.filter((tag) => currentPost.tags?.includes(tag))?.length ||
        0;
      score += commonTags * 10;

      // Score based on regions/cities similarity
      const commonRegions =
        post.region?.filter((region) => currentPost.region?.includes(region))
          ?.length || 0;
      score += commonRegions * 8;

      // Score based on engagement metrics
      score += (post.likes || 0) * 0.5;
      score += (post.views || 0) * 0.1;
      score += (post.saved_count || 0) * 0.3;

      // Time relevance (newer posts get higher scores)
      const daysSincePosting =
        (new Date() - new Date(post.created_at)) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 30 - daysSincePosting) * 0.5;

      return {
        ...post,
        relevanceScore: score,
      };
    });

    // Sort by relevance score and return top posts
    return scoredPosts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting related posts:", error);
    return [];
  }
};

export const getSavedPosts = async (page = 1, pageSize = 10) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // First get the total count
    const { count: totalCount } = await supabase
      .from("saved_posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // If requesting beyond available data, return empty result
    if (from >= totalCount) {
      return {
        data: [],
        count: totalCount,
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("saved_posts")
      .select(
        `
        *,
        posts (
          post_id,
          title,
          content,
          image_url,
          tags,
          likes,
          views,
          created_at,
          yoiki,
          saved_count,
          category
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data:
        data?.map((item) => ({
          ...item.posts,
          savedAt: item.created_at,
        })) || [],
      count: totalCount,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return { data: null, count: 0, error };
  }
};

export const checkPostSaved = async (postId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    if (!postId) return false;

    const { data, error } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking saved status:", error);
    return false;
  }
};

export const togglePostSave = async (postId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    if (!postId) throw new Error("Invalid post ID");

    const isSaved = await checkPostSaved(postId);

    if (isSaved) {
      // Remove save
      const { error: deleteError } = await supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Decrease post save count using the function
      const { data, error: updateError } = await supabase.rpc(
        "decrement_post_saved_count",
        {
          post_id_param: postId,
        }
      );

      if (updateError) throw updateError;

      return false;
    } else {
      // Add save
      const { error: insertError } = await supabase.from("saved_posts").insert({
        post_id: postId,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      // Increase post save count using the function
      const { data, error: updateError } = await supabase.rpc(
        "increment_post_saved_count",
        {
          post_id_param: postId,
        }
      );

      if (updateError) throw updateError;

      return true;
    }
  } catch (error) {
    console.error("Error toggling post save:", error);
    throw error;
  }
};

export const getUserCreatedCourses = async (page = 1, pageSize = 10) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("category", "Travel Courses")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data,
      count,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user created courses:", error);
    return { data: null, count: 0, error };
  }
};

export const fetchUserTravelCourses = async (page = 1, pageSize = 10) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("travel_courses")
      .select(
        `
        course_id,
        title,
        travel_type,
        region,
        start_date,
        end_date,
        created_at,
        daily_courses (
          daily_course_id,
          day,
          points
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Process the points data
    const processedData = data?.map((course) => ({
      ...course,
      daily_courses: course.daily_courses?.sort((a, b) => a.day - b.day),
    }));

    return {
      data: processedData,
      hasMore: data.length === pageSize,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching travel courses:", error);
    return { data: null, hasMore: false, error };
  }
};

export const getUserPosts = async (userId, page = 1, pageSize = 10) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return { data: null, count: 0, error };
  }
};

export const trackPostView = async (postId) => {
  try {
    const sessionId =
      localStorage.getItem("viewSessionId") || crypto.randomUUID();

    // Store session ID if not exists
    if (!localStorage.getItem("viewSessionId")) {
      localStorage.setItem("viewSessionId", sessionId);
    }

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if view already exists
    const { data: existingView } = await supabase
      .from("post_views")
      .select("id")
      .eq("post_id", postId)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!existingView) {
      // Insert view record only if it doesn't exist
      const { error } = await supabase
        .from("post_views")
        .insert({
          post_id: postId,
          user_id: user?.id || null,
          session_id: sessionId,
        })
        .single();

      if (error && error.code !== "23505") {
        throw error;
      }
    }

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("views")
      .eq("post_id", postId)
      .single();

    if (fetchError) throw fetchError;

    return post.views;
  } catch (error) {
    console.error("Error tracking view:", error);
    return null;
  }
};

export const attachCourseToPost = async (postId, courseId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .update({ travel_course_id: courseId })
      .eq("post_id", postId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error attaching course:", error);
    return { data: null, error };
  }
};

export const updatePost = async (postId, updates) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating post:", error);
    return { data: null, error };
  }
};

export const deletePost = async (postId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.rpc("delete_post_cascade", {
      post_id_param: postId,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { error };
  }
};

export const extractTransportationTypes = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from("daily_courses")
      .select("points")
      .eq("travel_course_id", courseId);

    if (error) throw error;

    if (!data) return [];

    const allTransportation = data.flatMap((day) =>
      day.points.filter((point) => point.trans).map((point) => point.trans)
    );

    return [...new Set(allTransportation)];
  } catch (error) {
    console.error("Error extracting transportation types:", error);
    return [];
  }
};

export const fetchCourseRegions = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from("travel_courses")
      .select("region")
      .eq("course_id", courseId)
      .single();

    if (error) throw error;
    return data?.region || [];
  } catch (error) {
    console.error("Error fetching course regions:", error);
    return [];
  }
};

export const updateScheduleEvent = async (eventId, updates) => {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .update(updates)
      .eq("id", eventId)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating schedule event:", error);
    return { data: null, error };
  }
};

export const deleteScheduleEvent = async (eventId) => {
  try {
    const { error } = await supabase
      .from("schedule")
      .delete()
      .eq("id", eventId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting schedule event:", error);
    return { error };
  }
};

export const deleteTravelCourse = async (courseId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error: dailyCoursesError } = await supabase
      .from("daily_courses")
      .delete()
      .eq("travel_course_id", courseId);

    if (dailyCoursesError) throw dailyCoursesError;

    const { error } = await supabase
      .from("travel_courses")
      .delete()
      .eq("course_id", courseId)
      .eq("user_id", user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting travel course:", error);
    return { error };
  }
};

export const searchContent = async (searchQuery, options = {}) => {
  const {
    page = 1,
    pageSize = 10,
    category = null,
    sortBy = "created_at",
    sortDirection = "desc",
  } = options;

  try {
    if (!searchQuery || searchQuery.trim() === "") {
      return { data: [], count: 0, error: null };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Create the base query
    let query = supabase.from("posts").select("*", { count: "exact" });

    // Add search conditions - search in title, content, and tags
    query = query.or(
      `title.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`
    );

    // Add category filter if provided
    if (category) {
      query = query.eq("category", category);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortDirection === "asc" });

    // Add pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error(`Error in searchContent: ${error.message}`);
    return { data: [], count: 0, error };
  }
};
