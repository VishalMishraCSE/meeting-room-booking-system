"use client";

import React from "react";

interface StarRating2DProps {
  rating: number;
  maxStars?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  hoverRating?: number;
  onHoverChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating2D({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  hoverRating = 0,
  onHoverChange,
  className = "",
}: StarRating2DProps) {
  const sizeMap = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-9 h-9",
  };

  const starSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starNumber = i + 1;
        const isFilled = hoverRating > 0 ? starNumber <= hoverRating : starNumber <= rating;

        const starElement = (
          <svg
            key={starNumber}
            className={`${starSize} transition-all duration-150 ${
              isFilled
                ? "text-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
                : "text-slate-300 dark:text-slate-700"
            } ${interactive ? "hover:scale-115 active:scale-95" : ""}`}
            viewBox="0 0 24 24"
            fill={isFilled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isFilled ? "1.2" : "1.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );

        if (interactive) {
          return (
            <button
              key={starNumber}
              type="button"
              onClick={() => onRatingChange && onRatingChange(starNumber)}
              onMouseEnter={() => onHoverChange && onHoverChange(starNumber)}
              onMouseLeave={() => onHoverChange && onHoverChange(0)}
              className="p-1 focus:outline-none cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors"
              aria-label={`Rate ${starNumber} out of ${maxStars} stars`}
            >
              {starElement}
            </button>
          );
        }

        return <span key={starNumber}>{starElement}</span>;
      })}
    </div>
  );
}
