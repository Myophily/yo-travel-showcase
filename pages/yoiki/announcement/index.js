import React, { useState, useEffect } from "react";
import Head from "next/head";
import YoikiHeader from "../../../components/YoikiHeader";
import NavigationButtons from "../../../components/NavigationButtons";
import Alert1 from "../../../components/Alert1";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../../utils/supabaseAnnouncements";
import { isUserAdmin } from "../../../utils/supabase";

const YoikiAnnouncement = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    pinned: false,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const adminStatus = await isUserAdmin();
    setIsAdmin(adminStatus);
  };

  const loadAnnouncements = async () => {
    const { data, error } = await fetchAnnouncements();
    if (!error && data) {
      const sortedAnnouncements = data.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setAnnouncements(sortedAnnouncements);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    setIsSubmitting(true);
    try {
      const { error } = await createAnnouncement(
        newAnnouncement.title,
        newAnnouncement.content,
        newAnnouncement.pinned
      );
      if (error) throw error;

      setNewAnnouncement({ title: "", content: "", pinned: false });
      loadAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Failed to create announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAnnouncement = async (announcementId, updates) => {
    try {
      const { data, error } = await updateAnnouncement(announcementId, updates);
      if (error) throw error;
      loadAnnouncements(); // Refresh the list
    } catch (error) {
      console.error("Error updating announcement:", error);
      alert("Failed to update announcement. Please try again.");
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      const { error } = await deleteAnnouncement(announcementId);
      if (error) throw error;
      loadAnnouncements(); // Refresh the list
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Failed to delete announcement. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </Head>
      <div className="flex flex-col items-start justify-start bg-white min-h-screen">
        <YoikiHeader />
        <NavigationButtons activePage="/yoiki/announcement" />

        {isAdmin && (
          <div className="relative box-border flex-stretch flex flex-col items-start justify-start w-full mx-auto overflow-hidden space-y-2 p-8">
            <div className="self-stretch flex flex-col items-start justify-start w-full">
              <form
                onSubmit={handleCreateAnnouncement}
                className="w-full bg-white rounded-lg space-y-4"
              >
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-darkslategray">
                    공지사항 제목
                  </label>
                  <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-darkslategray">
                    공지사항 내용
                  </label>
                  <textarea
                    placeholder="내용을 입력하세요"
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[200px] rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAnnouncement.pinned}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          pinned: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-orangered border-gray-300 focus:ring-orangered focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-darkslategray">
                      상단 고정
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer px-6 py-2.5 bg-orangered rounded-lg text-sm font-semibold text-white hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        등록 중...
                      </span>
                    ) : (
                      "등록하기"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="self-stretch mx-8 flex flex-col max-w-full">
          {announcements.map((announcement) => (
            <Alert1
              key={announcement.id}
              announcement={announcement}
              isPinned={announcement.pinned}
              isAdmin={isAdmin}
              onUpdate={handleUpdateAnnouncement}
              onDelete={handleDeleteAnnouncement}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default YoikiAnnouncement;
