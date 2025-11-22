import React, { useState } from "react";
import PropTypes from "prop-types";

const Alert1 = ({
  announcement,
  isPinned = false,
  isAdmin = false,
  onUpdate,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(announcement?.title || "");
  const [editedContent, setEditedContent] = useState(
    announcement?.content || ""
  );
  const [editedPinned, setEditedPinned] = useState(isPinned);

  if (!announcement) return null;

  const handleUpdate = async () => {
    await onUpdate(announcement.id, {
      title: editedTitle,
      content: editedContent,
      pinned: editedPinned,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await onDelete(announcement.id);
    }
  };

  if (isEditing) {
    return (
      <div className="self-stretch shadow-md rounded-lg overflow-hidden bg-white p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full [border:none] [outline:none] bg-whitesmoke-100 h-[35px] rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter text-xs text-zinc-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full [border:none] [outline:none] bg-whitesmoke-100 rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter text-xs text-zinc-800 min-h-[100px]"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editedPinned}
              onChange={(e) => setEditedPinned(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">
              Pin this announcement
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-white bg-orangered rounded-lg hover:bg-red-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`self-stretch shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] rounded-lg overflow-hidden ${
        isPinned ? "bg-red-50" : "bg-gray"
      }`}
    >
      <div
        className="cursor-pointer p-3 flex items-center justify-between text-xs text-darkslategray font-open-sans"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isPinned ? (
            <span className="mr-2 text-red-500">
              <i className="fas fa-thumbtack"></i>
            </span>
          ) : (
            <img
              className="h-4 w-4 relative overflow-hidden shrink-0 min-h-[16px]"
              alt=""
              src="/alert-icon.svg"
            />
          )}
          <div className="font-semibold">{announcement.title}</div>
        </div>
        <img
          className={`h-4 w-4 relative shrink-0 min-h-[16px] transition-transform duration-300 ${
            isExpanded ? "transform rotate-180" : ""
          }`}
          alt=""
          src="/iconlylightoutlinearrow--down-2.svg"
        />
      </div>
      {isExpanded && (
        <div className="p-3 pt-0 text-xs text-darkslategray font-open-sans">
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">
            {announcement.content}
          </p>
          {isAdmin && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-mistyrose text-orangered rounded-lg hover:bg-orangered hover:text-white transition-colors text-sm"
              >
                수정
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Alert1.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.number.isRequired, // Changed back to id
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    pinned: PropTypes.bool,
  }),
  isPinned: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default Alert1;
