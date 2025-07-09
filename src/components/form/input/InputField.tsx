import React, { FC } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  onChange?: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((value: string, name?: string) => void);
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  value,
  defaultValue,
  placeholder,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
}) => {
  const inputClasses = [
    "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800",
    className,
    disabled
      ? "text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
      : error
      ? "text-error-800 border-error-500 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500"
      : success
      ? "text-success-500 border-success-400 focus:ring-success-500/10 dark:text-success-400 dark:border-success-500"
      : "border-gray-300 dark:border-gray-700",
  ].join(" ");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const inputValue = e.target.value;
    // Support both types of onChange
    if (typeof onChange === "function") {
      try {
        (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
      } catch {
        (onChange as (value: string, name?: string) => void)(inputValue, name);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        placeholder={placeholder}
        onChange={handleChange}
        className={inputClasses}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
      {hint && <small className={`text-${error ? 'red' : 'gray'}-500 text-xs mt-1`}>{hint}</small>}
    </div>
  );
};

export default Input;
