"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"employee" | "manager" | "admin">("employee");
  const [rememberMe, setRememberMe] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (storedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Set mock credentials when role changes
  useEffect(() => {
    if (selectedRole === "employee") {
      setEmail("employee@lumina.com");
      setPassword("employee123");
    } else if (selectedRole === "manager") {
      setEmail("manager@lumina.com");
      setPassword("manager123");
    } else if (selectedRole === "admin") {
      setEmail("admin@lumina.com");
      setPassword("admin123");
    }
    setErrorMessage("");
  }, [selectedRole]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Simulate small latency for premium feels
    setTimeout(() => {
      let authenticated = false;
      let targetRole = "";
      let targetName = "";

      if (email === "employee@lumina.com" && password === "employee123") {
        authenticated = true;
        targetRole = "employee";
        targetName = "Alex Rivers";
      } else if (email === "manager@lumina.com" && password === "manager123") {
        authenticated = true;
        targetRole = "manager";
        targetName = "Sarah Jenkins";
      } else if (email === "admin@lumina.com" && password === "admin123") {
        authenticated = true;
        targetRole = "admin";
        targetName = "Admin.01";
      }

      if (authenticated) {
        localStorage.setItem("userRole", targetRole);
        localStorage.setItem("userName", targetName);
        
        // Redirect according to role
        if (targetRole === "employee") {
          router.push("/");
        } else if (targetRole === "manager") {
          router.push("/manager");
        } else if (targetRole === "admin") {
          router.push("/admin");
        }
      } else {
        setErrorMessage("Invalid corporate credentials. Please try simulated roles.");
        setIsSubmitting(false);
      }
    }, 800);
  };

  // Generate 20 stars with fixed random positions to ensure consistency and avoid hydration mismatches
  const stars = [
    { top: "10%", left: "15%", delay: "0.2s", size: "2px" },
    { top: "25%", left: "80%", delay: "1.5s", size: "1px" },
    { top: "40%", left: "35%", delay: "0.7s", size: "3px" },
    { top: "60%", left: "70%", delay: "2.1s", size: "2px" },
    { top: "80%", left: "20%", delay: "1.2s", size: "1px" },
    { top: "15%", left: "55%", delay: "0.5s", size: "2px" },
    { top: "75%", left: "85%", delay: "1.8s", size: "3px" },
    { top: "50%", left: "10%", delay: "2.5s", size: "2px" },
    { top: "90%", left: "50%", delay: "0.9s", size: "1px" },
    { top: "30%", left: "90%", delay: "1.1s", size: "2px" },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background text-on-surface relative overflow-hidden select-none">
      {/* Theme Toggle (Absolute Top Right) */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-surface-container/60 hover:bg-surface-variant hover:text-primary transition-all duration-300 border border-outline-variant/20 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-95"
        title="Toggle Theme"
      >
        <span className="material-symbols-outlined text-primary text-xl">
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </span>
      </button>

      {/* Cosmic Nebula Glows (Only in Dark Mode) */}
      {theme === "dark" && (
        <>
          <div className="ambient-glow-indigo !left-10 !top-10 opacity-70"></div>
          <div className="ambient-glow-violet !right-10 !bottom-10 opacity-70"></div>
          {/* Stars */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {stars.map((star, idx) => (
              <div 
                key={idx}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay,
                  animationDuration: "3s",
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Main Layout Container */}
      <div className="flex w-full min-h-screen">
        {/* Left Column: Visual/Marketing (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-low overflow-hidden border-r border-outline-variant/10">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105 hover:scale-100" 
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAcpZdST_Gu-nhdwmNspGHaLSPeFLrDt7kc66i7sh1pznvCa-CFssHN63l7_dFAlci2UpoFTkOPnLk_-vl5WOnez39MDKTxnAFyeYssa3-o4bAUCch52TW7YK4UU5JmZgxgVnNRgUhcCDWFNWeuoZ1gD6hTjNr0KU1H8fgB9tqiDj4DLuMdbzVU0XF7mK6FnXLVpbM7PXktF1iMFfyHfWGq-PIBB82jayCbs7jFJpRfAay2G_E1H0WZ4mZKe1ww3BSe-FzTfIsyZtrc')" 
            }}
          >
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-background/80 to-background/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Branding */}
            <div>
              <h1 className="font-headline-xl text-3xl text-white tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  meeting_room
                </span>
                Lumina Reserve
              </h1>
              <p className="mt-4 font-body-lg text-lg text-secondary/80 max-w-md">
                Enterprise workspace optimization and intelligent resource management.
              </p>
            </div>

            {/* Stats/Testimonial Glass Panel */}
            <div className="glass-panel rounded-2xl p-6 max-w-lg shadow-2xl transition-all duration-500 hover:border-primary/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/20 p-3 rounded-lg flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <div>
                  <p className="font-headline-md text-xl font-bold text-white">99.9%</p>
                  <p className="font-label-sm text-xs text-secondary/80 uppercase tracking-widest">System Reliability</p>
                </div>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant italic leading-relaxed">
                &ldquo;Lumina Reserve transformed our spatial efficiency, providing unparalleled clarity into our global real estate portfolio.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-variant/80 flex items-center justify-center border border-outline-variant/50">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant">person</span>
                </div>
                <p className="font-label-md text-xs text-secondary">Director of Operations, Global Tech</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface/10 backdrop-blur-md relative z-10">
          <div className="w-full max-w-md flex flex-col gap-6">
            {/* Mobile Branding (Visible only on small screens) */}
            <div className="lg:hidden mb-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-high mb-3 border border-outline-variant/20 shadow-xl">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  meeting_room
                </span>
              </div>
              <h1 className="font-headline-xl text-3xl text-on-surface font-extrabold">Lumina Reserve</h1>
            </div>

            {/* Form Container */}
            <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-primary/5">
              {/* Decorative accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-inverse-primary"></div>
              
              <div className="mb-6">
                <h2 className="font-headline-md text-2xl text-on-surface font-bold mb-1">Secure Access</h2>
                <p className="font-body-sm text-xs text-on-surface-variant">Enter your corporate credentials to proceed.</p>
              </div>

              {/* Simulated Role Selection Integrations */}
              <div className="mb-6">
                <span className="font-label-sm text-xs text-on-surface-variant block mb-2 font-semibold">Simulated Roles Quick Selection</span>
                <div className="grid grid-cols-3 gap-2 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl p-1">
                  {(["employee", "manager", "admin"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`py-2 px-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                        selectedRole === role
                          ? "bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_8px_rgba(128,131,255,0.15)]"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 border border-transparent"
                      }`}
                    >
                      {role === "employee" ? "Employee" : role === "manager" ? "Manager" : "Sys Admin"}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-xs text-error flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="email">
                    Corporate Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <input 
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                      id="email" 
                      placeholder="name@company.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="password">
                      Password
                    </label>
                    <a className="font-label-sm text-xs text-primary hover:text-primary-fixed transition-colors" href="#">
                      Forgot credentials?
                    </a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </div>
                    <input 
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                      id="password" 
                      placeholder="••••••••" 
                      required 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center">
                  <input 
                    className="h-4 w-4 rounded border-outline-variant/50 bg-surface-container-low text-primary focus:ring-primary focus:ring-offset-surface cursor-pointer"
                    id="remember-me" 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="ml-2 block font-body-sm text-xs text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                    Remember this device for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  className={`w-full h-12 btn-gradient-primary text-white font-label-md text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 active:scale-98 ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Authenticate
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* SSO Options */}
              <div className="mt-6 pt-6 border-t border-outline-variant/20">
                <p className="font-label-sm text-xs text-center text-on-surface-variant mb-4 uppercase tracking-widest font-semibold">
                  Or continue with
                </p>
                <button 
                  onClick={() => {
                    // Instantly login as active selected role via SSO simulation
                    const clickEvent = { preventDefault: () => {} };
                    handleLogin(clickEvent as any);
                  }}
                  className="w-full h-11 bg-surface-container hover:bg-surface-variant hover:text-primary border border-outline-variant/30 text-on-surface font-label-md text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-98"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">shield</span>
                  Enterprise SSO
                </button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="text-center flex justify-center gap-6 font-label-sm text-xs text-on-surface-variant/80">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#">Contact IT Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
