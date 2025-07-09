"use client";
import React from "react";

interface StepProgressBarProps {
  steps: number;
  currentStep: number; // 1-based index
  progress_titles: string[];
}

export default function StepProgressBar({
  steps,
  currentStep,
  progress_titles,
}: StepProgressBarProps) {
  const progressPercent = steps > 1 ? ((currentStep - 1) / (steps - 1)) * 100 : 0;
  
  return (
    progress_titles?.length > 0 && (
      <div className="progress-bar">
        <div className="progress" id="progress" style={{ width: `${progressPercent}%` }} />
        {progress_titles.map((title, index) => {
          const isActive = index < currentStep;
          return (<div key={index} className={`progress-step ${isActive ? 'active' : ''}`}  data-title={title} />);
        })}
      </div>
    )
  );
}