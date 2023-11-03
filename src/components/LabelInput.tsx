// react
import { FC } from "react";

interface LabelInputProps {
  labelText: string;
  placeholderText: string;
  textarea?: boolean;
  name: string;
}

const LabelInput: FC<LabelInputProps> = ({
  labelText,
  placeholderText,
  textarea,
  name,
}) => {
  return (
    <div className="flex flex-col gap-2.5 flex-1 w-full">
      <label
        htmlFor={placeholderText}
        className="text-textPrimary text-base sm:text-lg font-bold"
      >
        {labelText}
      </label>

      {textarea ? (
        <textarea
          name={name}
          id={placeholderText}
          rows={9}
          placeholder={placeholderText}
          className="bg-accent rounded-2xl py-4 px-6 text-textPrimary text-base sm:text-lg
         placeholder-textSecondary outline-none resize-none border-[1px] border-transparent focus:border-hoverSecondary"
        ></textarea>
      ) : (
        <input
          type="text"
          name={name}
          id={placeholderText}
          placeholder={placeholderText}
          autoComplete="off"
          className="bg-accent rounded-2xl py-4 px-6 text-textPrimary text-base sm:text-lg
          placeholder-textSecondary outline-none resize-none border-[1px] border-transparent focus:border-hoverSecondary"
        />
      )}
    </div>
  );
};

export default LabelInput;
