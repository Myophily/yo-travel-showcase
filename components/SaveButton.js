import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { checkPostSaved, togglePostSave } from '../utils/supabase';

const SaveButton = ({ postId, savedCount, onSaveToggle }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkInitialSaveStatus();
  }, [postId]);

  const checkInitialSaveStatus = async () => {
    const saved = await checkPostSaved(postId);
    setIsSaved(saved);
  };

  const handleSaveClick = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const newSaveStatus = await togglePostSave(postId);
      setIsSaved(newSaveStatus);
      if (onSaveToggle) {
        onSaveToggle(newSaveStatus);
      }
    } catch (error) {
      if (error.message === 'User not authenticated') {
        router.push('/login');
      } else {
        console.error('Error toggling save:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveClick}
      disabled={loading}
      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
        isSaved
          ? 'bg-orangered text-white'
          : 'bg-mistyrose text-orangered hover:bg-orangered hover:text-white'
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isSaved ? 'white' : '#FF3C26'}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
        />
      </svg>
      <span className="text-sm">{savedCount || 0}</span>
    </button>
  );
};

export default SaveButton;