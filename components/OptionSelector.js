const OptionSelector = ({ onChange, value, disabled }) => {
  return (
    <div className="self-stretch rounded-lg flex flex-col items-start justify-start gap-2.5 text-base text-systemblack">
      <div className="self-stretch shadow-[0px_4px_14px_rgba(0,_0,_0,_0.1)] rounded-lg overflow-hidden">
        <select
          id="options"
          className={`w-full bg-white h-11 border-none outline-none px-4 font-open-sans text-base text-darkslategray-100 
            ${disabled ? "cursor-not-allowed bg-gray-100" : ""}`}
          onChange={(e) => onChange(e.target.value)}
          value={value}
          disabled={disabled}
        >
          <option value="" disabled>
            선택
          </option>
          <option value="Travel Courses">여행코스</option>
          <option value="Community">자유게시판</option>
        </select>
      </div>
      {disabled && (
        <p className="text-xs text-gray-500 mt-1">
          여행코스가 첨부되면 카테고리를 바꿀 수 없습니다.
        </p>
      )}
    </div>
  );
};

export default OptionSelector;
