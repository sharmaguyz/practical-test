import React from "react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  className?: string;
  id?: string;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  disabled,
  className = "",
  id,
  type = "submit",
  children,
  ...rest
}) => {
  return (
    <button
      id={id}
      type={type}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors
        ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"} 
        ${className}`}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
      )}
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default LoadingButton;
