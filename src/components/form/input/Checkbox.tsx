import React from "react";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  name?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  name,
  value="",
  onChange,
  className = "",
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If user passed `name`, simulate full event-like object
    if (typeof onChange === "function") {
      if (onChange?.length === 1) {
        if (name) {
          // Simulate event structure
          const simulatedEvent = {
            target: {
              name,
              checked: e.target.checked,
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          onChange(simulatedEvent);
        } else {
          // Just pass boolean if no name
          onChange(e.target.checked);
        }
      }
    }
  };

  return (
    <label
      className={`flex items-center space-x-3 group cursor-pointer ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <div className="relative w-5 h-5">
        <input
          id={id}
          name={name}
          type="checkbox"
          className={`w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60 ${className}`}
          value={value?.toString()}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        {checked && (
          <svg
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && <span className="text-sm dark:text-white">{label}</span>}
    </label>
  );
};

export default Checkbox;
