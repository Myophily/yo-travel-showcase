import { supabase } from "./supabase";

export const createTravelCourse = async (courseData) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("No authenticated user found");

    // Simplify region data to just city names
    const cities = Object.entries(courseData.selectedCities).flatMap(
      ([_, cities]) => cities
    );

    const { data: course, error: courseError } = await supabase
      .from("travel_courses")
      .insert({
        title: courseData.title,
        travel_type: courseData.travelType,
        region: cities,
        start_date: courseData.startDate,
        end_date: courseData.endDate,
        user_id: user.id,
      })
      .select()
      .single();

    if (courseError) {
      throw new Error("Failed to create travel course: " + courseError.message);
    }

    // Create daily courses with proper JSONB formatting
    const dailyCoursesData = courseData.days
      .map((day, index) => {
        // Filter out invalid places
        const validPlaces = day.places.filter(
          (place) => place && place.name && place.x && place.y
        );

        if (validPlaces.length === 0) return null;

        return {
          travel_course_id: course.course_id,
          day: index + 1,
          points: validPlaces.map((place) => ({
            name: place.name,
            x: typeof place.x === "string" ? parseFloat(place.x) : place.x,
            y: typeof place.y === "string" ? parseFloat(place.y) : place.y,
            trans: place.transport || null,
          })),
        };
      })
      .filter(Boolean); // Remove null entries

    // Only insert if there are valid daily courses
    if (dailyCoursesData.length > 0) {
      const { error: dailyCoursesError } = await supabase
        .from("daily_courses")
        .insert(dailyCoursesData);

      if (dailyCoursesError) {
        // Rollback travel course creation
        await supabase
          .from("travel_courses")
          .delete()
          .match({ course_id: course.course_id });
        throw new Error(
          "Failed to create daily courses: " + dailyCoursesError.message
        );
      }
    }

    return { success: true, courseId: course.course_id };
  } catch (error) {
    console.error("Error creating travel course:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

export const updateTravelCourse = async (courseId, courseData) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("No authenticated user found");

    // Simplify region data to just city names
    const cities = Object.entries(courseData.selectedCities).flatMap(
      ([_, cities]) => cities
    );

    const { data: course, error: courseError } = await supabase
      .from("travel_courses")
      .update({
        title: courseData.title,
        travel_type: courseData.travelType,
        region: cities,
        start_date: courseData.startDate,
        end_date: courseData.endDate,
      })
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (courseError) {
      throw new Error("Failed to update travel course: " + courseError.message);
    }

    const { count, error: countError } = await supabase
      .from("travel_courses")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("user_id", user.id);

    if (countError) throw countError;
    if (count === 0) throw new Error("Course not found or user doesn't have permission");

    const { error: deleteError } = await supabase
      .from("daily_courses")
      .delete()
      .eq("travel_course_id", courseId);

    if (deleteError) {
      throw new Error("Failed to update daily courses: " + deleteError.message);
    }

    // Create new daily courses with updated data
    const dailyCoursesData = courseData.days
      .map((day, index) => {
        // Filter out invalid places
        const validPlaces = day.places.filter(
          (place) =>
            place &&
            place.name &&
            place.name.trim() !== "" &&
            place.x &&
            place.y
        );

        if (validPlaces.length === 0) return null;

        return {
          travel_course_id: courseId,
          day: index + 1,
          points: validPlaces.map((place) => ({
            name: place.name,
            x: typeof place.x === "string" ? parseFloat(place.x) : place.x,
            y: typeof place.y === "string" ? parseFloat(place.y) : place.y,
            trans: place.transport || null,
          })),
        };
      })
      .filter(Boolean); // Remove null entries

    // Only insert if there are valid daily courses
    if (dailyCoursesData.length > 0) {
      const { error: dailyCoursesError } = await supabase
        .from("daily_courses")
        .insert(dailyCoursesData);

      if (dailyCoursesError) {
        throw new Error(
          "Failed to create daily courses: " + dailyCoursesError.message
        );
      }
    }

    return { success: true, courseId };
  } catch (error) {
    console.error("Error updating travel course:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};
