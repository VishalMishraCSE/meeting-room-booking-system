"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PayswiffLogo from "@/components/PayswiffLogo";
import FlashScreen from "@/components/FlashScreen";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  // Flash Screen State
  const [showFlash, setShowFlash] = useState<boolean>(true);
  const [flashMessage, setFlashMessage] = useState<string>("Initializing Corporate Portal...");

  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Sign Up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  // Account Recovery / Forgot Password state
  const [recoveryStep, setRecoveryStep] = useState<"request" | "verify" | "reset">("request");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryNewName, setRecoveryNewName] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [recoveryCurrentName, setRecoveryCurrentName] = useState("");

  const [rememberMe, setRememberMe] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setFlashMessage("Authenticating Credentials...");
    setShowFlash(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Write to localStorage for client-side state
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userId", data.user.id.toString());

      setFlashMessage(`Welcome back, ${data.user.name}! Redirecting to workspace...`);

      // Smooth delay for luxury flash transition
      setTimeout(() => {
        const targetPath = data.user.role === "admin" ? "/admin" : data.user.role === "manager" ? "/manager" : "/";
        window.location.href = targetPath;
      }, 500);
    } catch (err: any) {
      setShowFlash(false);
      setErrorMessage(err.message || "Invalid corporate credentials.");
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
          role: "Employee",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Store local user state
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userId", data.user.id.toString());

      setSuccessMessage("Account created successfully! Redirecting...");

      setTimeout(() => {
        const targetPath = data.user.role === "admin" ? "/admin" : data.user.role === "manager" ? "/manager" : "/";
        window.location.href = targetPath;
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.");
      setIsSubmitting(false);
    }
  };

  const handleSendRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setErrorMessage("Please enter your registered corporate email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send security code.");
      }

      setRecoveryCurrentName(data.currentName || "");
      setRecoveryNewName(data.currentName || "");
      setRecoveryStep("verify");
      setSuccessMessage("A 6-digit security code has been sent to your email!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send security code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryOtp.trim() || recoveryOtp.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit security code sent to your email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          otp: recoveryOtp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid security code.");
      }

      setRecoveryCurrentName(data.currentName || "");
      if (!recoveryNewName) setRecoveryNewName(data.currentName || "");
      setRecoveryStep("reset");
      setSuccessMessage("Security code verified! Please set your new password below.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify security code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryNewPassword.trim()) {
      setErrorMessage("Please enter your new password.");
      return;
    }

    if (recoveryNewPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setErrorMessage("New passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/reset-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          otp: recoveryOtp.trim(),
          newName: recoveryNewName.trim(),
          newPassword: recoveryNewPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update credentials.");
      }

      setEmail(recoveryEmail.trim());
      setPassword(recoveryNewPassword.trim());
      setSuccessMessage("Your new password has been updated in the database! You can now sign in.");
      setAuthMode("signin");
      setRecoveryStep("request");
      setRecoveryOtp("");
      setRecoveryNewPassword("");
      setRecoveryConfirmPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Flash Screen Transition Overlay */}
      <FlashScreen
        show={showFlash}
        message={flashMessage}
        minDuration={3200}
        onFinished={() => setShowFlash(false)}
      />

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-surface-container/60 hover:bg-surface-variant hover:text-primary transition-all duration-300 border border-outline-variant/20 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-95"
        title="Toggle Theme"
      >
        <span className="material-symbols-outlined text-primary text-xl">
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </span>
      </button>

      {/* Cosmic Nebula Glows (Dark Mode) */}
      {theme === "dark" && (
        <>
          <div className="ambient-glow-indigo !left-10 !top-10 opacity-70"></div>
          <div className="ambient-glow-violet !right-10 !bottom-10 opacity-70"></div>
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
        {/* Left Column: Visual Branding (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-low overflow-hidden border-r border-outline-variant/10">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105 hover:scale-100" 
            style={{ 
              backgroundImage: "url('/login-bg.jpg')" 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/5 to-transparent"></div>
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-start p-12 w-full">
            <div>
              <div className="mb-2">
                <PayswiffLogo size="xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In / Sign Up / Recovery Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface/10 backdrop-blur-md relative z-10">
          <div className="w-full max-w-md flex flex-col gap-6">
            {/* Mobile Branding */}
            <div className="lg:hidden mb-4 flex justify-center">
              <PayswiffLogo size="lg" />
            </div>

            {/* Form Container */}
            <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-red-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-500"></div>
              
              {/* Header Tabs */}
              {authMode !== "forgot" ? (
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className={`font-headline-md text-lg font-bold transition-all relative pb-2 ${
                        authMode === "signin"
                          ? "text-red-600 border-b-2 border-red-600"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className={`font-headline-md text-lg font-bold transition-all relative pb-2 ${
                        authMode === "signup"
                          ? "text-red-600 border-b-2 border-red-600"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                  
                  <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
                    {authMode === "signin" ? "Portal Access" : "New Account"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
                  <div>
                    <h2 className="font-headline-md text-lg font-bold text-red-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-600 text-[20px]">lock_reset</span>
                      Account Recovery
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Reset password or update username</p>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full uppercase">
                    OTP Security
                  </span>
                </div>
              )}

              {/* Status Alert Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {successMessage}
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {authMode === "signin" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="email">
                      Corporate Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">mail</span>
                      </div>
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                        id="email" 
                        placeholder="e.g. employee@company.com" 
                        required 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="password">
                        Password
                      </label>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">lock</span>
                      </div>
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                        id="password" 
                        placeholder="••••••••" 
                        required 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input 
                        className="h-4 w-4 rounded border-outline-variant/50 bg-surface-container-low text-red-600 accent-red-600 focus:ring-red-500 cursor-pointer"
                        id="remember-me" 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="ml-2 block font-body-sm text-xs text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                        Remember device
                      </label>
                    </div>

                    {/* Forgot Password / Username Trigger Link */}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        setRecoveryStep("request");
                        setRecoveryEmail(email || "");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-xs text-red-600 hover:text-red-500 font-semibold hover:underline transition-colors"
                    >
                      Forgot Password or Username?
                    </button>
                  </div>

                  <button 
                    className={`w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-label-md text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-98 ${
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
                        Sign In
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 2. SIGN UP FORM */}
              {authMode === "signup" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="signUpName">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                        id="signUpName" 
                        placeholder="e.g. Sarah Jenkins" 
                        required 
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="signUpEmail">
                      Corporate Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">mail</span>
                      </div>
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                        id="signUpEmail" 
                        placeholder="s.jenkins@company.com" 
                        required 
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="signUpPassword">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">lock</span>
                      </div>
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                        id="signUpPassword" 
                        placeholder="At least 6 characters" 
                        required 
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    className={`w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-label-md text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-98 ${
                      isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account & Sign In
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 3. FORGOT PASSWORD OR USERNAME RECOVERY FORM */}
              {authMode === "forgot" && (
                <div className="space-y-4">
                  {/* STEP 1: REQUEST OTP */}
                  {recoveryStep === "request" && (
                    <form onSubmit={handleSendRecoveryOtp} className="space-y-4">
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Enter your registered corporate Gmail address. We will send a secure <strong className="text-red-500">6-digit security code (OTP)</strong> to verify your identity before allowing you to set a new password or username.
                      </p>

                      <div className="space-y-1.5">
                        <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="recoveryEmail">
                          Corporate Gmail Address
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-lg">mail</span>
                          </div>
                          <input 
                            className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                            id="recoveryEmail" 
                            placeholder="e.g. employee@company.com" 
                            required 
                            type="email"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <button 
                        className={`w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-label-md text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-98 ${
                          isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Sending Security Code...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">send</span>
                            Send Security Code (OTP)
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* STEP 2: VERIFY 6-DIGIT OTP */}
                  {recoveryStep === "verify" && (
                    <form onSubmit={handleVerifyRecoveryOtp} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span className="material-symbols-outlined text-sm shrink-0">mark_email_read</span>
                          <span className="truncate">Code sent to: <strong>{recoveryEmail}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRecoveryStep("request");
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="text-[11px] text-red-500 underline font-bold hover:text-red-400 shrink-0 ml-2"
                        >
                          Change
                        </button>
                      </div>

                      {/* 6-Digit OTP Field */}
                      <div className="space-y-1.5">
                        <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="recoveryOtp">
                          Enter 6-Digit Security Code <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-lg">verified_user</span>
                          </div>
                          <input 
                            className="w-full pl-10 pr-4 py-3 bg-surface-container-low/50 border border-red-500/40 rounded-xl font-mono text-center tracking-[6px] text-lg font-bold text-red-500 placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 focus:outline-none transition-all duration-200 shadow-inner"
                            id="recoveryOtp" 
                            placeholder="123456" 
                            maxLength={6}
                            required 
                            type="text"
                            value={recoveryOtp}
                            onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ""))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-on-surface-variant">Didn&apos;t receive the code?</span>
                        <button
                          type="button"
                          onClick={handleSendRecoveryOtp}
                          disabled={isSubmitting}
                          className="text-red-600 font-bold hover:underline hover:text-red-500"
                        >
                          Resend Code
                        </button>
                      </div>

                      <button 
                        className={`w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-label-md text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-98 ${
                          isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Verifying Security Code...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Verify Security Code
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* STEP 3: SET NEW PASSWORD & UPDATE USERNAME */}
                  {recoveryStep === "reset" && (
                    <form onSubmit={handleResetCredentials} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
                        <span>Security verified for: <strong>{recoveryEmail}</strong></span>
                      </div>

                      {/* Username / Name Edit Field */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="recoveryNewName">
                            Username / Full Name
                          </label>
                          {recoveryCurrentName && (
                            <span className="text-[10px] text-outline">Current: {recoveryCurrentName}</span>
                          )}
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-lg">person</span>
                          </div>
                          <input 
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                            id="recoveryNewName" 
                            placeholder="Enter new username" 
                            type="text"
                            value={recoveryNewName}
                            onChange={(e) => setRecoveryNewName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* New Password Field */}
                      <div className="space-y-1.5">
                        <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="recoveryNewPassword">
                          Set New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-lg">lock</span>
                          </div>
                          <input 
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                            id="recoveryNewPassword" 
                            placeholder="At least 6 characters" 
                            required
                            type="password"
                            value={recoveryNewPassword}
                            onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Confirm New Password Field */}
                      <div className="space-y-1.5">
                        <label className="font-label-md text-xs text-on-surface-variant block font-medium" htmlFor="recoveryConfirmPassword">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-lg">check</span>
                          </div>
                          <input 
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all duration-200 shadow-inner group-hover:border-outline-variant/60"
                            id="recoveryConfirmPassword" 
                            placeholder="Re-enter new password" 
                            required
                            type="password"
                            value={recoveryConfirmPassword}
                            onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <button 
                        className={`w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-label-md text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-98 ${
                          isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Updating Database...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">save</span>
                            Save & Update New Password
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Mode Switch Helper */}
              <div className="mt-6 pt-4 border-t border-outline-variant/20 text-center">
                {authMode === "signin" ? (
                  <p className="text-xs text-on-surface-variant">
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-red-600 font-bold hover:underline hover:text-red-500"
                    >
                      Sign Up Now
                    </button>
                  </p>
                ) : authMode === "signup" ? (
                  <p className="text-xs text-on-surface-variant">
                    Already have a corporate account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-red-600 font-bold hover:underline hover:text-red-500"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-xs text-red-600 font-bold hover:underline hover:text-red-500 flex items-center justify-center gap-1 mx-auto"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
