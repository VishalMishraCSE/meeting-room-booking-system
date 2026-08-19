import React from "react";
import Image from "next/image";

interface PayswiffLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  subtitle?: string;
  iconOnly?: boolean;
  className?: string;
  lightBackground?: boolean;
}

export default function PayswiffLogo({
  size = "md",
  subtitle = "",
  iconOnly = false,
  className = "",
  lightBackground = false,
}: PayswiffLogoProps) {
  // Dimensions map
  const sizeConfig = {
    xs: { height: 22, width: 72, subClass: "text-[8px]", badgePadding: "px-1.5 py-0.2" },
    sm: { height: 28, width: 92, subClass: "text-[9px]", badgePadding: "px-2 py-0.5" },
    md: { height: 36, width: 118, subClass: "text-[10px]", badgePadding: "px-2.5 py-0.5" },
    lg: { height: 46, width: 152, subClass: "text-[11px]", badgePadding: "px-3 py-1" },
    xl: { height: 58, width: 190, subClass: "text-xs", badgePadding: "px-3.5 py-1" },
  }[size];

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Official Payswiff Logo Image from Logo folder */}
        <div 
          className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ${
            lightBackground 
              ? "p-1" 
              : "bg-white/95 backdrop-blur-md px-2.5 py-1.5 shadow-md border border-white/20 hover:bg-white"
          }`}
        >
          <Image
            src="/Payswiff-Logo.svg"
            alt="Payswiff"
            width={sizeConfig.width}
            height={sizeConfig.height}
            className="object-contain drop-shadow-sm h-auto"
            priority
          />
        </div>

        {/* Subtitle Badge if present */}
        {subtitle && !iconOnly && (
          <span
            className={`font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg shadow-sm ${sizeConfig.subClass} ${sizeConfig.badgePadding}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
