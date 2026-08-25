"use client";

import React, { useEffect, useState } from "react";

interface FlashScreenProps {
  message?: string;
  subMessage?: string;
  show?: boolean;
  minDuration?: number;
  onFinished?: () => void;
}

export default function FlashScreen({
  message = "Loading Workspace...",
  subMessage = "Payswiff Enterprise Platform",
  show = true,
  minDuration = 3200,
  onFinished,
}: FlashScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    if (!show) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onFinished) onFinished();
      }, 500);
      return () => clearTimeout(timer);
    }

    setIsVisible(true);
    setIsFadingOut(false);

    // Auto-dismiss after minDuration has completed
    const tFade = setTimeout(() => {
      setIsFadingOut(true);
    }, minDuration);

    const tEnd = setTimeout(() => {
      setIsVisible(false);
      if (onFinished) onFinished();
    }, minDuration + 500);

    return () => {
      clearTimeout(tFade);
      clearTimeout(tEnd);
    };
  }, [show, minDuration, onFinished]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-all duration-500 ease-out select-none ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient Pulsing Aura */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-red-600/20 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute w-[300px] h-[300px] bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="relative z-10 flex flex-col items-center px-6 py-8 max-w-lg w-full">
        {/* Animated Brand Logo SVG Box */}
        <div className="relative bg-white/95 backdrop-blur-xl px-7 py-6 rounded-3xl shadow-[0_0_50px_rgba(232,41,43,0.35)] border border-white/60 flex items-center justify-center overflow-hidden mb-6">
          <svg
            viewBox="0 0 600 182"
            className="w-[280px] sm:w-[380px] md:w-[440px] h-auto drop-shadow-sm overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="splashPillarsGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#E8292B" />
                <stop offset="100%" stopColor="#F15B2D" />
              </linearGradient>
            </defs>

            {/* ─── 1. FOUR PILLARS (Show One by One) ─── */}
            <g id="PillarsGroup">
              {/* Pillar 1 */}
              <path
                d="M17.46,0 L0,0 L0,181.97 L17.46,164.49 Z"
                fill="url(#splashPillarsGrad)"
                className="splash-pillar-1"
              />

              {/* Pillar 2 */}
              <path
                d="M47.77,0 L30.30,0 L30.30,151.67 L47.77,134.19 Z"
                fill="url(#splashPillarsGrad)"
                className="splash-pillar-2"
              />

              {/* Pillar 3 */}
              <path
                d="M78.07,0 L60.59,0 L60.59,121.36 L78.07,103.88 Z"
                fill="url(#splashPillarsGrad)"
                className="splash-pillar-3"
              />

              {/* Pillar 4 */}
              <path
                d="M108.38,0 L90.90,0 L90.90,91.06 L108.38,73.58 Z"
                fill="url(#splashPillarsGrad)"
                className="splash-pillar-4"
              />
            </g>

            {/* ─── 2. "PAYSWIFF" WORDMARK (Swiftly slides in from Right to Left) ─── */}
            <g id="PayswiffWordmark" className="splash-wordmark">
              {/* P */}
              <path
                d="M154.1,83.14 L138.39,83.14 L138.39,0.07 L169.8,0.07 C178.12,1.22 185.59,4.45 191.93,9.46 C198.21,18.31 201.15,26.27 201.15,32.01 C201.15,40.5 197.04,48.26 191.96,54.54 C185.78,59.72 178.16,63.05 169.79,63.88 L154.08,63.88 L154.1,83.14 Z M154.1,16.04 L154.1,47.96 L169.8,47.96 C175.88,46.72 180.86,43.29 184.22,38.21 C185.45,34.19 185.45,29.83 184.22,25.81 C180.86,20.73 175.88,17.3 169.8,16.06 L154.1,16.04 Z"
                fill="#5A5A5C"
              />
              {/* A */}
              <path
                d="M265.75,82.64 L262.06,82.64 L256.13,74.29 C251.52,78.01 246.41,81.02 240.89,83.04 C235.16,83.78 226.98,83.05 223.27,81.62 C216.32,78.09 210.77,72.59 206.97,65.25 C204.57,56.74 204.57,46.94 206.97,38.62 C210.77,31.27 216.31,25.57 223.27,21.79 C230.93,19.44 237.1,19.44 246.47,22.22 C251.58,25.29 256.14,29.1 262.07,21.88 L265.76,21.88 L265.76,82.62 Z M250.36,51.67 C250.36,45.5 245.89,40.22 241.06,36.53 C235.16,35.14 229.26,36.22 224.46,39.41 C221.24,44.61 220.07,51.68 221.24,58.75 C224.46,63.96 229.26,67.15 235.16,68.23 C241.06,66.83 245.89,63.14 249.16,57.86 C250.36,53.82 250.36,51.7 250.36,51.67 Z"
                fill="#5A5A5C"
              />
              {/* Y */}
              <path
                d="M310.75,23.57 L310.75,55.67 C309.88,60.31 307.46,64.34 303.88,67.2 C299.52,68.29 295.12,67.5 291.53,65.14 C288.49,61.2 288.2,55.67 288.2,55.67 L288.2,23.57 L273.3,23.57 L273.3,55.67 C273.98,63.78 278.61,73.55 287.83,80.77 C299.46,84.68 309.28,80.38 309.64,80.27 C307.51,84.08 304.47,87.1 300.72,89.1 C296.51,89.83 288.2,89.73 288.2,105.03 L295.86,105.13 C303.85,104.33 311.08,101.14 316.96,96.23 C321.82,90.29 325.76,82.93 325.79,74.83 L325.79,23.59 L310.75,23.57 Z"
                fill="#5A5A5C"
              />
              {/* S */}
              <path
                d="M367.12,83.14 L332.97,83.14 L332.97,68.02 L367.12,68.02 C370.47,66.17 370.84,64.24 370.84,62.12 C369.02,61.78 367.12,61.62 351.58,61.62 C344.3,60.12 338.39,56.03 334.42,49.99 C332.97,42.59 334.42,35.2 338.39,29.19 C344.3,25.16 351.58,23.69 381.84,23.69 L381.84,38.81 L351.58,38.81 C347.86,41.56 347.86,45.35 351.58,46.49 L367.12,46.49 C376.61,48.67 384.26,57.06 385.74,64.24 C385.25,71.61 380.25,77.61 374.34,81.67 C372.07,82.65 367.12,83.14 367.12,83.14 Z"
                fill="#5A5A5C"
              />
              {/* W */}
              <path
                d="M465.42,60.61 C463.67,69.38 458.89,76.55 451.77,81.36 C446.14,83.13 435.06,81.66 428.11,77.38 C423.78,80.68 418.71,82.64 413.23,83.13 C404.53,81.36 397.44,76.55 392.66,69.38 C390.91,60.61 390.91,23.68 390.91,23.68 L405.85,23.68 L405.85,60.61 C406.81,64.42 409.46,67.12 413.24,68.08 C417.05,67.12 419.78,64.43 420.74,60.61 L420.74,23.68 L435.63,23.68 L435.63,60.61 C436.64,64.42 439.31,67.12 443.09,68.08 C446.91,67.12 449.59,64.43 450.6,60.61 L450.6,23.68 L465.49,23.68 Z"
                fill="#5A5A5C"
              />
              {/* I */}
              <path
                d="M481.59,17.51 C476.27,15.73 472.98,10.01 472.98,8.79 C474.12,4.34 478.22,0.77 481.59,0.07 C486.92,1.85 490.26,7.61 490.26,8.79 C489.12,13.24 484.95,16.81 481.59,17.51 Z M474.02,23.57 L489.07,23.57 L489.07,83.14 L474.02,83.14 Z"
                fill="#5A5A5C"
              />
              {/* FF */}
              <path
                d="M539.7,0 L539.7,15.12 L528.48,15.12 C524.02,15.98 520.46,18.37 518.07,21.99 C517.2,24.89 517.2,29.35 529.75,29.35 L529.75,44.48 L517.2,44.48 L517.2,83.13 L502.28,83.14 L502.28,44.49 L495.0,44.49 L495.0,29.37 L502.28,29.37 L502.28,26.54 C504.32,16.19 509.95,7.77 518.3,2.09 C521.47,0.7 524.86,0 528.48,0 Z M581.84,0 L581.84,15.12 L570.62,15.12 C566.16,15.98 562.61,18.37 560.22,21.99 C559.35,24.89 559.35,29.35 581.84,29.35 L581.84,44.48 L559.35,44.48 L559.35,83.13 L544.42,83.14 L544.42,44.49 L537.15,44.49 L537.15,29.37 L544.42,29.37 L544.42,26.54 C546.47,16.19 552.1,7.77 560.44,2.09 C563.61,0.7 567.01,0 570.62,0 Z"
                fill="#5A5A5C"
              />
            </g>

            {/* ─── 3. "A SUBSIDIARY OF CHOLA" WITH SPINNING CHAKRA ─── */}
            <g id="SubsidiaryCholaGroup" className="splash-subsidiary">
              {/* "A SUBSIDIARY OF" text label */}
              <text
                x="142"
                y="138"
                fill="#334155"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="22"
                fontWeight="700"
                letterSpacing="4"
              >
                A SUBSIDIARY OF
              </text>

              {/* ─── SPINNING CHOLA CHAKRA FLOWER EMBLEM ─── */}
              <g id="CholaChakraFlower" className="splash-chakra">
                {/* Red Petals */}
                <path
                  d="M415.2,124.97 C415.85,119.27 424.82,112.74 427.68,109.51 C429.71,107.23 430.18,101.63 430.18,101.63 C430.18,101.63 433.18,107.85 429.69,113.03 C428.29,115.12 421.1,122.1 419.62,126.44 C419.05,128.1 418.76,130.25 419.9,132.13 C416.86,130.89 414.71,129.23 415.2,124.97 Z"
                  fill="#EB3538"
                />
                <path
                  d="M414.79,126.75 C411.78,125.46 409.36,123.37 409.93,119.14 C410.68,113.45 419.75,107.08 422.68,103.89 C424.76,101.64 425.31,96.15 425.31,96.15 C425.31,96.15 428.2,102.41 424.63,107.54 C423.19,109.61 415.88,116.46 414.31,120.77 C413.72,122.41 413.33,124.55 414.79,126.75 Z"
                  fill="#EB3538"
                />
                <path
                  d="M434.57,127.48 C437.61,128.72 439.76,130.4 439.27,134.63 C438.62,140.34 429.65,146.87 426.79,150.1 C424.76,152.38 424.28,157.98 424.28,157.98 C424.28,157.98 421.29,151.76 424.77,146.57 C426.18,144.49 433.37,137.51 434.85,133.17 C435.41,131.51 435.71,129.36 434.57,127.48 Z"
                  fill="#EB3538"
                />
                <path
                  d="M439.68,132.86 C442.69,134.15 445.11,136.23 444.54,140.47 C443.79,146.16 434.72,152.53 431.78,155.72 C429.71,157.97 429.16,163.46 429.16,163.46 C429.16,163.46 426.27,157.2 429.84,152.07 C431.28,149.99 438.59,143.15 440.16,138.84 C440.75,137.2 441.13,135.05 439.68,132.86 Z"
                  fill="#EB3538"
                />

                {/* Blue Petals */}
                <path
                  d="M429.56,137.14 C428.32,140.17 426.66,142.32 422.4,141.83 C416.7,141.18 410.16,132.22 406.93,129.36 C404.65,127.33 399.05,126.87 399.05,126.87 C399.05,126.87 405.27,123.88 410.46,127.36 C412.55,128.77 419.54,135.95 423.87,137.43 C425.53,138 427.68,138.29 429.56,137.15 Z"
                  fill="#274D8D"
                />
                <path
                  d="M424.18,142.25 C422.89,145.26 420.8,147.67 416.56,147.11 C410.87,146.35 404.5,137.29 401.32,134.35 C399.06,132.28 393.56,131.73 393.56,131.73 C393.56,131.73 399.83,128.84 404.96,132.41 C407.04,133.85 413.88,141.15 418.19,142.72 C419.84,143.32 421.97,143.7 424.18,142.25 Z"
                  fill="#274D8D"
                />
                <path
                  d="M432.08,117.77 C437.79,118.43 444.32,127.39 447.55,130.25 C449.83,132.28 455.43,132.75 455.43,132.75 C455.43,132.75 449.21,135.75 444.02,132.26 C436.08,125.55 432.2,122.73 430.61,122.19 C428.95,121.63 426.8,121.33 424.92,122.47 C426.15,119.43 427.83,117.29 432.08,117.77 Z"
                  fill="#274D8D"
                />
                <path
                  d="M430.29,117.36 C431.58,114.35 433.67,111.94 437.9,112.5 C443.59,113.26 449.97,122.32 453.15,125.26 C455.41,127.33 460.9,127.88 460.9,127.88 C460.9,127.88 454.63,130.77 449.51,127.2 C447.43,125.76 440.59,118.46 436.27,116.89 C434.63,116.29 432.49,115.91 430.29,117.36 Z"
                  fill="#274D8D"
                />
              </g>

              {/* "Chola" Bold Typography */}
              <text
                x="475"
                y="146"
                fill="#1e293b"
                fontFamily="Georgia, serif"
                fontSize="42"
                fontWeight="700"
                fontStyle="italic"
                letterSpacing="1"
              >
                Chola
              </text>
            </g>
          </svg>
        </div>

        {/* Dynamic Status Progress Text */}
        <div className="flex flex-col items-center gap-1.5 text-center mt-2">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
            {message || "Initializing Workspace Portal..."}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
            {subMessage}
          </p>
        </div>

        {/* Shimmer Ambient Loading Bar */}
        <div className="w-56 h-1 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 relative shadow-inner mt-4">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full w-full animate-[flashProgress_1.2s_ease-in-out_infinite]"></div>
        </div>

        {/* Security / System Footer Badge */}
        <div className="mt-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Verified Enterprise Gateway</span>
        </div>
      </div>
    </div>
  );
}
