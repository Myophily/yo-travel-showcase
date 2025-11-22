import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
  supabase,
  getCurrentUser,
  isUserAdmin,
  fetchCourseRegions,
  extractTransportationTypes,
} from "../../utils/supabase";
import OptionSelector from "../../components/OptionSelector";
import withAuth from "../../utils/withAuth";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const Write = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedCities, setSelectedCities] = useState({
    광역시: [],
    경기도: [],
    강원도: [],
    충청도: [],
    전라도: [],
    경상도: [],
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const router = useRouter();
  const MAX_TAGS = 3;
  const [isAdmin, setIsAdmin] = useState(false);
  const [isYoiki, setIsYoiki] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedTransportation, setSelectedTransportation] = useState([]);
  // Add state for yoiki categories
  const [yoikiCategories, setYoikiCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isUserAdmin();
      setIsAdmin(adminStatus);
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    // Check for selected course in localStorage
    const savedCourse = localStorage.getItem("selectedCourse");
    if (savedCourse) {
      const courseData = JSON.parse(savedCourse);
      setSelectedCourse(courseData);
      setCategory("Travel Courses"); // Automatically set category
      localStorage.removeItem("selectedCourse"); // Clear after retrieving
    }
  }, []);

  useEffect(() => {
    const loadTransportationFromCourse = async () => {
      if (selectedCourse?.course_id) {
        const transportTypes = await extractTransportationTypes(
          selectedCourse.course_id
        );
        setSelectedTransportation(transportTypes);
      }
    };

    loadTransportationFromCourse();
  }, [selectedCourse]);

  useEffect(() => {
    const checkForEditMode = async () => {
      // Check if in edit mode
      const { edit } = router.query;

      if (edit) {
        setEditMode(true);
        setEditPostId(edit);

        // Fetch the post data
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("post_id", edit)
          .single();

        if (error) {
          console.error("Error fetching post:", error);
          return;
        }

        if (data) {
          // Current user check
          const currentUser = await getCurrentUser();
          if (currentUser?.id !== data.user_id) {
            alert("You can only edit your own posts");
            router.push(`/post/${edit}`);
            return;
          }

          // Populate form fields
          setTitle(data.title || "");
          setContent(data.content || "");
          setTags(data.tags || []);
          setCategory(data.category || "");
          setIsYoiki(data.yoiki || false);
          setYoutubeUrl(data.youtube_url || "");
          setYoikiCategories(data.yoiki_category || []);

          if (data.travel_course_id) {
            // Fetch travel course details if needed
            const { data: courseData } = await supabase
              .from("travel_courses")
              .select("*")
              .eq("course_id", data.travel_course_id)
              .single();

            if (courseData) {
              setSelectedCourse(courseData);
            }
          }

          // Set transportation and region data
          setSelectedTransportation(data.transportation || []);

          // Handle region/cities if present
          if (data.region && Array.isArray(data.region)) {
            // This would need more complex logic to reconstruct the selectedCities object
            // Simplified version:
            const citiesByRegion = {
              광역시: [],
              경기도: [],
              강원도: [],
              충청도: [],
              전라도: [],
              경상도: [],
            };

            // For simplicity, we're just putting all cities in the "전체" region
            // A more complex implementation would need logic to detect which region each city belongs to
            setSelectedCities(citiesByRegion);
          }
        }
      }
    };

    if (router.isReady) {
      checkForEditMode();
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (tags.length > MAX_TAGS) {
      alert(`Tags limited to ${MAX_TAGS}`);
      return;
    }

    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        setSubmitStatus("error");
        router.push("/login");
        return;
      }

      // Extract cities from selectedCities
      const cities = Object.values(selectedCities).flat();

      // Common post data for both create and update
      const postData = {
        title,
        content,
        tags,
        category,
        region: cities,
        travel_course_id: selectedCourse?.course_id || null,
        transportation: selectedTransportation || [],
        yoiki: isAdmin && isYoiki,
        youtube_url: isAdmin ? youtubeUrl : null,
        yoiki_category: isAdmin && isYoiki ? yoikiCategories : null,
      };

      if (editMode) {
        // Update existing post
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("post_id", editPostId)
          .eq("user_id", currentUser.id); // Ensure user owns the post

        if (error) {
          console.error("Error updating post:", error);
          setSubmitStatus("error");
          return;
        }

        setSubmitStatus("success");
        router.push(`/post/${editPostId}`);
      } else {
        // Create new post
        const post_id = crypto.randomUUID();

        const newPostData = {
          post_id,
          user_id: currentUser.id,
          ...postData,
          image_url: "/placeholder-image.jpg",
          likes: 0,
          views: 0,
          saved_count: 0,
        };

        const { error } = await supabase.from("posts").insert([newPostData]);

        if (error) {
          console.error("Error inserting data:", error);
          setSubmitStatus("error");
          return;
        }

        setSubmitStatus("success");
        router.push(`/post/${post_id}`);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setSubmitStatus("error");
    }
  };

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

  const handleOptionChange = useCallback(
    (value) => {
      if (selectedCourse && value !== "Travel Courses") {
        // Show warning if trying to change category with attached course
        const confirmed = window.confirm(
          "Changing the category will remove the attached travel course. Do you want to continue?"
        );
        if (confirmed) {
          setSelectedCourse(null);
          setCategory(value);
        }
      } else {
        setCategory(value);
      }
    },
    [selectedCourse]
  );

  const handleCourseRemoval = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this travel course? This action cannot be undone."
    );

    if (confirmed) {
      setSelectedCourse(null);
      setSelectedTransportation([]); // Clear transportation when course is removed
      localStorage.removeItem("selectedCourse");
      setCategory("");
    }
  };

  // Add category selection handler
  const handleCategorySelect = (category) => {
    setYoikiCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Add new tag handling functions
  const processTag = (value) => {
    if (tags.length >= MAX_TAGS) {
      setFeedback({
        type: "error",
        message: `태그는 최대 ${MAX_TAGS}개까지만 입력 가능합니다.`,
      });
      return false;
    }

    const trimmedValue = value.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      return true;
    }
    return false;
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    if (value.endsWith(" ")) {
      const tagValue = value.slice(0, -1);
      if (processTag(tagValue)) {
        setTagInput("");
      } else {
        setTagInput(value.slice(0, -1));
      }
    } else {
      setTagInput(value);
    }
  };

  const handleTagInputBlur = (e) => {
    const value = e.target.value.trim();
    if (value && !value.endsWith(",")) {
      if (processTag(value)) {
        setTagInput("");
      }
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleTagsChange = (e) => {
    const inputValue = e.target.value;
    const newTags = inputValue
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    // Only take the first 3 tags
    const limitedTags = newTags.slice(0, MAX_TAGS);
    setTags(limitedTags);
  };

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
          <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray">
            글쓰기
          </h1>
        </div>
      </section>
      <section className="self-stretch flex flex-col items-start justify-start pt-0 px-8 pb-2.5 box-border max-w-full text-left text-xs text-darkslategray font-open-sans">
        <div className="self-stretch flex flex-col items-start justify-start gap-2.5 max-w-full">
          <OptionSelector
            onChange={handleOptionChange}
            value={category}
            disabled={!!selectedCourse}
          />

          {selectedCourse && (
            <div className="w-full bg-mistyrose rounded-lg">
              <div className="flex justify-between p-4 items-center">
                <div>
                  <h3 className="font-semibold text-darkslategray">
                    여행코스:
                  </h3>
                  <p className="text-sm mt-1">{selectedCourse.title}</p>
                </div>
                <button
                  onClick={handleCourseRemoval}
                  className="p-2 text-orangered hover:text-red-600 text-sm transition-colors rounded-lg"
                >
                  삭제
                </button>
              </div>
            </div>
          )}

          {category === "Travel Courses" && (
            <div className="w-full grid grid-flow-col justify-stretch item-stretch gap-2.5 text-center text-sm text-mistyrose">
              <button
                onClick={() => router.push("/write/make")}
                className=" cursor-pointer [border:none] py-1.5  bg-orangered rounded-lg flex flex-row items-center justify-center whitespace-nowrap flex-shrink-0"
              >
                <div className="relative text-sm leading-[20px] font-semibold font-open-sans text-mistyrose whitespace-nowrap">
                  새로 만들기 +
                </div>
              </button>
              <button
                onClick={() => router.push("/write/saved/courses")}
                className="cursor-pointer [border:none] py-1.5  bg-orangered rounded-lg flex flex-row items-center justify-center whitespace-nowrap flex-shrink-0"
              >
                <div className="relative text-sm leading-[20px] font-semibold font-open-sans text-mistyrose whitespace-nowrap">
                  불러오기 📂
                </div>
              </button>
            </div>
          )}
        </div>
      </section>
      <form
        onSubmit={handleSubmit}
        className="self-stretch flex flex-col gap-4 px-8 pb-6"
      >
        <input
          className="w-full border border-zinc-300 [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
          placeholder="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="w-full">
          <div className="bg-whitesmoke-100 rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="quill-editor"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <input
              className="w-full border-zinc-300 [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter text-xs text-zinc-800 min-w-[196px]"
              placeholder={`스페이스바로 구분, (최대 ${MAX_TAGS}개)`}
              value={tagInput}
              onChange={handleTagInputChange}
              onBlur={handleTagInputBlur}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {tags.length}/{MAX_TAGS}
            </div>
          </div>

          {/* Display current tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-mistyrose text-orangered px-2 py-1 rounded-lg text-xs"
              >
                <span>#{tag}</span>
                <div
                  type="button"
                  onClick={() => removeTag(index)}
                  className="h-[11px] relative font-semibold flex items-center justify-center min-w-[7p"
                >
                  ×
                </div>
              </div>
            ))}
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="yoiki"
              checked={isYoiki}
              onChange={(e) => setIsYoiki(e.target.checked)}
              className="w-4 h-4 text-orangered border-gray-300 rounded focus:ring-orangered"
            />
            <label htmlFor="yoiki" className="text-sm text-gray-700">
              가요이 게시물로 등록
            </label>
          </div>
        )}

        {/* Add yoiki_category selection (only visible if isAdmin and isYoiki are true) */}
        {isAdmin && isYoiki && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가요이 카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "시즌1",
                "시즌2",
                "시즌3",
                "시즌4",
                "당일취기",
                "데이트",
                "여행",
              ].map((category) => (
                <div
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`cursor-pointer border rounded-lg px-3 py-1 text-sm 
                    ${
                      yoikiCategories.includes(category)
                        ? "bg-mistyrose text-orangered border-orangered"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-zinc-300 [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
            />
          </div>
        )}

        {/* Replace the first button with this conditional rendering */}
        {!editMode && (
          <button
            type="submit"
            className="cursor-pointer [border:none] py-2.5 px-5 bg-mistyrose self-stretch rounded-lg flex flex-row items-start justify-center"
          >
            <div className="relative text-xs font-inter text-orangered text-left inline-block">
              등록
            </div>
          </button>
        )}
        <div className="flex gap-2 w-full">
          {editMode && (
            <div>
              <button
                type="button"
                onClick={() => router.push(`/post/${editPostId}`)}
                className="cursor-pointer py-2.5 px-5 bg-mistyrose self-stretch rounded-lg flex-1 flex flex-row items-start justify-center"
              >
                <div className="relative text-xs font-inter text-orangered text-left inline-block">
                  취소
                </div>
              </button>

              <button
                type="submit"
                className="cursor-pointer [border:none] py-2.5 px-5 bg-orangered self-stretch rounded-lg flex-1 flex flex-row items-start justify-center"
              >
                <div className="relative text-xs font-inter text-mistyrose text-left inline-block">
                  {editMode ? "수정 완료" : "등록"}
                </div>
              </button>
            </div>
          )}
        </div>
      </form>
      {submitStatus === "error" && (
        <p className="text-red-500 px-8">
          Error submitting post. Please try again.
        </p>
      )}
    </div>
  );
};

export default withAuth(Write);
