import React from "react";

interface RadioProps {
  id: string; // Unique ID for the radio button
  name: string; // Radio group name
  value: string; // Value of the radio button
  checked: boolean; // Whether the radio button is checked
  label: string; // Label for the radio button
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; // Optional additional classes
  disabled?: boolean; // Optional disabled state for the radio button
}

const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
  disabled = false,
}) => {

  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled
          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          : "text-gray-700 dark:text-gray-400"
      } ${className}`}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
        disabled={disabled}
      />
      {/* Add custom UI for the radio button here */}
      <span className="h-4 w-4 rounded-full border border-gray-400 flex items-center justify-center">
        {checked && <div className="h-2 w-2 rounded-full bg-brand-500" />}
      </span>
      {label}
    </label>
  );
};

export default Radio;
