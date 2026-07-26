// react
import { FC } from "react";

interface LabelInputProps {
  labelText: string;
  placeholderText: string;
  textarea?: boolean;
  name: string;
  type?: string;
}

const LabelInput: FC<LabelInputProps> = ({
  labelText,
  placeholderText,
  textarea,
  name,
  type = "text",
}) => {
  const inputClasses = `bg-surface border border-stroke rounded-xl py-3.5 px-5 text-textPrimary text-base
    placeholder-textMuted outline-none resize-none w-full
    focus:border-accent/60 focus:bg-surfaceHover transition-colors duration-200`;

  return (
    <div className="flex flex-col gap-2 flex-1 w-full">
      <label htmlFor={name} className="text-textSecondary text-sm font-medium">
        {labelText}
      </label>

      {textarea ? (
        <textarea
          name={name}
          id={name}
          rows={7}
          required
          placeholder={placeholderText}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          required
          placeholder={placeholderText}
          autoComplete="off"
          className={inputClasses}
        />
      )}
    </div>
  );
};

export default LabelInput;
