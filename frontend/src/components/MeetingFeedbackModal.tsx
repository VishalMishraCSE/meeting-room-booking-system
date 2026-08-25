"use client";

import React, { useState } from "react";
import StarRating2D from "./StarRating2D";

interface MeetingFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: {
    id: string | number;
    title: string;
    roomName: string;
    roomId?: string | number;
    date?: string;
    time?: string;
  } | null;
  onFeedbackSubmitted?: () => void;
}

const RATING_LEVELS = [
  {
    rating: 1,
    emoji: "😡",
    label: "Terrible",
    desc: "Major facility or AV issues",
    colorClass: "from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400",
    activeBadge: "bg-rose-500 text-white",
  },
  {
    rating: 2,
    emoji: "🙁",
    label: "Poor",
    desc: "Needs clear improvement",
    colorClass: "from-orange-500/20 to-amber-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400",
    activeBadge: "bg-orange-500 text-white",
  },
  {
    rating: 3,
    emoji: "😐",
    label: "Average",
    desc: "Met basic expectations",
    colorClass: "from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300",
    activeBadge: "bg-amber-600 text-white",
  },
  {
    rating: 4,
    emoji: "😊",
    label: "Good",
    desc: "Productive & comfortable",
    colorClass: "from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300",
    activeBadge: "bg-teal-600 text-white",
  },
  {
    rating: 5,
    emoji: "🤩",
    label: "Exceptional",
    desc: "Flawless corporate session",
    colorClass: "from-amber-500/25 to-orange-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300",
    activeBadge: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
  },
];

const QUICK_TAGS = [
  "⚡ High-Speed WiFi",
  "📽️ Clear Display / AV",
  "❄️ Comfortable AC",
  "🧹 Clean & Tidy",
  "💡 Perfect Lighting",
  "🔇 Great Soundproofing",
  "🔌 Easy Power Access",
  "🎙️ Great Microphones",
  "☕ Clean Refreshments"
];

export default function MeetingFeedbackModal({
  isOpen,
  onClose,
  booking,
  onFeedbackSubmitted,
}: MeetingFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  const currentLevel = RATING_LEVELS.find((l) => l.rating === (hoverRating || rating)) || RATING_LEVELS[4];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullComment = [
        selectedTags.length > 0 ? `Tags: ${selectedTags.join(", ")}` : "",
        comment.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          roomId: booking.roomId,
          rating,
          comment: fullComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setComment("");
        setSelectedTags([]);
        setRating(5);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
        onClose();
      }, 1400);
    } catch (err: any) {
      alert(err.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6 transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glows */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Meeting Room Feedback</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                How was your session in <strong className="text-primary font-semibold">{booking.roomName}</strong>?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 animate-fade-in relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-2">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Feedback Received!</h3>
            <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
              Thank you for rating {booking.roomName}. Your feedback helps our facilities team ensure peak workspace quality.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
            {/* Meeting Summary Pill */}
            <div className="bg-surface-container-high/60 border border-outline-variant/20 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">Concluded Session</span>
                  <span className="text-on-surface font-semibold truncate max-w-[260px] block">{booking.title || "Corporate Meeting"}</span>
                </div>
              </div>
              {booking.date && (
                <span className="text-on-surface-variant font-medium text-[11px] bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/15">
                  {booking.date}
                </span>
              )}
            </div>

            {/* Interactive Emoji Sentiment & 2D Vector Stars */}
            <div className="flex flex-col items-center justify-center gap-3 py-4 px-3 bg-surface-container-low/70 rounded-2xl border border-outline-variant/20 shadow-inner">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                How would you rate this room?
              </span>

              {/* 5-Level Emoji Selector */}
              <div className="grid grid-cols-5 gap-2 w-full max-w-md">
                {RATING_LEVELS.map((lvl) => {
                  const isSelected = rating === lvl.rating;
                  const isHovered = hoverRating === lvl.rating;
                  return (
                    <button
                      key={lvl.rating}
                      type="button"
                      onClick={() => setRating(lvl.rating)}
                      onMouseEnter={() => setHoverRating(lvl.rating)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? `bg-gradient-to-b ${lvl.colorClass} shadow-md scale-105 ring-2 ring-amber-500/40`
                          : isHovered
                          ? "bg-surface-container-highest/80 border-outline-variant scale-102"
                          : "bg-surface-container/50 border-outline-variant/20 hover:border-outline-variant/50"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-1 transform transition-transform group-hover:scale-125 select-none">
                        {lvl.emoji}
                      </span>
                      <span className="text-[11px] font-bold text-on-surface">
                        {lvl.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 2D Flat Vector Star Picker */}
              <div className="flex items-center gap-1 mt-1">
                <StarRating2D
                  rating={rating}
                  hoverRating={hoverRating}
                  interactive={true}
                  size="lg"
                  onRatingChange={(r) => setRating(r)}
                  onHoverChange={(r) => setHoverRating(r)}
                />
              </div>

              {/* Dynamic Sentiment Description Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/80 border border-outline-variant/20 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <span>{currentLevel.emoji}</span>
                <span>{currentLevel.rating} / 5 — {currentLevel.desc}</span>
              </div>
            </div>

            {/* Quick Highlights Tags */}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                What went well? (Select highlights)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm font-semibold scale-102"
                          : "bg-surface-container-high/60 text-on-surface-variant border-outline-variant/30 hover:border-outline hover:text-on-surface"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Comment Box */}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Detailed Feedback & Suggestions (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with room equipment, temperature, audio, whiteboard, or convenience..."
                rows={3}
                className="w-full bg-surface-container-high/80 border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                Skip For Now
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
