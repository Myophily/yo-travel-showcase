import { supabase } from "./supabase";

export const fetchAnnouncements = async (page = 1, pageSize = 10) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("announcement")
      .select("*", { count: "exact" })
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return { data: null, count: 0, error };
  }
};

export const createAnnouncement = async (title, content, pinned = false) => {
  try {
    const { data, error } = await supabase
      .from("announcement")
      .insert({
        title,
        content,
        pinned: pinned ? true : false,
      })
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { data: null, error };
  }
};

export const updateAnnouncement = async (announcementId, updates) => {
  try {
    const { data, error } = await supabase
      .from("announcement")
      .update(updates)
      .eq("id", announcementId)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { data: null, error };
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    const { error } = await supabase
      .from("announcement")
      .delete()
      .eq("id", announcementId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { error };
  }
};
