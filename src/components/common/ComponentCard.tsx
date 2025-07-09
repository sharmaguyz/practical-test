import React from "react";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import { redirect } from "next/navigation";
interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  is_show_button?: boolean; // Show button or not
  button_text?: string; // Button text
  button_link?: string; // Button link
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  is_show_button = false,
  button_text = "Button Text",
  button_link = "#",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className={`${title? "px-6 py-5" : "" }`}>
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {desc}
          </p>
        )}
      </div>
      {
        is_show_button && (
          <div className="px-6 py-5">
        
            <Link href={button_link} >
              <Button size="sm"  className="text-sm font-medium" variant="primary">
                {button_text}
              </Button>
            </Link>
          </div>
        )
      }

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
