import React from "react";

const ContentForm = ({
  title,
  setTitle,
  content,
  setContent,
  tags,
  setTags,
  onSubmit,
}) => (
  <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-6 box-border max-w-full">
    <form
      onSubmit={onSubmit}
      className="flex-1 rounded-lg bg-white flex flex-col items-start justify-start gap-2.5 max-w-full"
    >
      <input
        className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-lightslategray-200 min-w-[196px]"
        placeholder="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="[border:none] bg-whitesmoke-100 h-[286px] w-auto [outline:none] self-stretch rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter text-xs text-lightslategray-200"
        placeholder="Where did you go?"
        rows={14}
        cols={16}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <input
        className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter text-xs text-lightslategray-200 min-w-[196px]"
        placeholder="#Tag (comma-separated)"
        type="text"
        value={tags.join(", ")}
        onChange={(e) =>
          setTags(e.target.value.split(",").map((tag) => tag.trim()))
        }
      />
      <button
        type="submit"
        className="cursor-pointer [border:none] py-2.5 px-5 bg-mistyrose self-stretch rounded-lg flex flex-row items-start justify-center"
      >
        <div className="w-[23px] relative text-xs font-inter text-orangered text-left inline-block text-ellipsis whitespace-nowrap">
          등록
        </div>
      </button>
    </form>
  </section>
);

export default ContentForm;
