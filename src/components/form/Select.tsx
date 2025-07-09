import React, { useState, useEffect } from "react";

// interface Option {
//   value: string;
//   label: string;
//   [key: string]: any;
// }

interface SelectProps<T = any> {
  options: T[];
  placeholder?: string;
  onChange: ((value: string) => void) | ((e: { target: { name: string; value: string } }) => void);
  className?: string;
  defaultValue?: string;
  labelKey?: keyof T;
  valueKey?: keyof T;
  name: string;
  warn?: string;
  error?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  labelKey = "",
  valueKey = "",
  name = "",
  warn = "",
  error = false,
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  useEffect(() => {
    setSelectedValue(defaultValue || "");
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
  
    const simulatedEvent = { target: { name, value } };
  
    // Check if onChange expects an event-style object (name/value) or just the value string
    if (typeof onChange === "function") {
      if (onChange?.length === 1) {
        // Try calling it with the simulated event object
        const maybeEventHandler = onChange as (arg: any) => void;
  
        // If it has a target.name and target.value, it’ll be handled properly
        maybeEventHandler(simulatedEvent);
      } else {
        // Fallback: treat it as a simple (value: string) => void
        (onChange as (value: string) => void)(value);
      }
    }
  };
  
// console.log("Selected Value:", selectedValue); // Debugging line
// console.log("defaultValue:", defaultValue); // Debugging line
  return (
    <>
    <select
      name={name}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option, index) => {
      const value = valueKey ? option[valueKey] : option.value;
      const label = labelKey ? option[labelKey] : option.label;

      return (
        <option
          key={value ?? index}
          value={value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {label}
        </option>
      );
    })}
    </select>
    { warn && <small className={`text-${error ? 'red' : 'yellow'}-500 text-xs mt-1`}>{warn}</small>}
    </>
  );
};

export default Select;
