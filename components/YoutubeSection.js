import { memo } from "react";

const YoutubeSection = memo(({ youtubeUrl }) => {
  if (!youtubeUrl) return null;

  // Extract video ID from YouTube URL
  const getYoutubeVideoId = (url) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId = getYoutubeVideoId(youtubeUrl);
  if (!videoId) return null;

  return (
    <div className="self-stretch flex-1 rounded-lg bg-gainsboro-200">
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
});

export default YoutubeSection;
