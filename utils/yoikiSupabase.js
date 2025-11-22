import { supabase } from "./supabase";

export const fetchYoikiCourses = async (
  lastTimestamp,
  pageSize = 10,
  selectedRegion = "전체",
  cities = [],
  sortMethod = "latest",
  categories = []
) => {
  try {
    let query = supabase
      .from("posts")
      .select(
        `
    post_id,
    title,
    content,
    image_url,
    tags,
    likes,
    views,
    created_at,
    yoiki_category,
    saved_count,
    region,
    want_to_go_count,
    been_there_count
  `
      )
      .eq("yoiki", true)
      .limit(pageSize);

    if (cities && cities.length > 0) {
      query = query.overlaps("region", cities);
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

    if (categories && categories.length > 0) {
      query = query.overlaps("yoiki_category", categories);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching Yoiki courses:", error);
    return { data: null, error };
  }
};
