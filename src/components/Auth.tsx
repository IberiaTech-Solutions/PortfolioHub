"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LogoFull } from "@/components/Logo";
import { useToast } from "@/components/Toast";

type AuthMode = "signin" | "signup" | "forgot_password" | "reset_password";

type PasswordCheck = {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

function validatePassword(pw: string): PasswordCheck {
  return {
    minLength: pw.length >= 8,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  };
}

function isPasswordStrong(checks: PasswordCheck): boolean {
  return Object.values(checks).every(Boolean);
}

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"candidate" | "recruiter">("candidate");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const { toast } = useToast();
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  // Prevent open redirect — only allow internal paths
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";

  const passwordChecks = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user && authMode !== "reset_password") {
        router.push(redirectTo);
      }
    };
    checkUser();
  }, [redirectTo, router, authMode]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "reset_password") setAuthMode("reset_password");
    else if (mode === "signup") setAuthMode("signup");
    else if (mode === "signin") setAuthMode("signin");
  }, [searchParams]);

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // reset

    if (!supabase) {
      toast("Database not configured", "error");
      return;
    }

    // Signup validations
    if (authMode === "signup") {
      if (!isPasswordStrong(passwordChecks)) {
        toast("Password doesn't meet all requirements", "error");
        return;
      }
      if (!passwordsMatch) {
        toast("Passwords don't match", "error");
        return;
      }
    }

    try {
      setLoading(true);

      if (authMode === "signin") {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data?.user) router.push(redirectTo);
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: selectedRole,
            },
          },
        });
        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          // Don't reveal whether email exists — same message as success
          toast("If this email is not already registered, you'll receive a confirmation link shortly.", "success");
        } else if (data?.user && !data?.session) {
          toast("If this email is not already registered, you'll receive a confirmation link shortly.", "success");
        } else if (data?.session) {
          router.push("/create-portfolio");
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("Email not confirmed")) {
        toast("Unable to sign in. Please check your email for a confirmation link.", "error");
      } else if (msg.includes("Invalid login credentials")) {
        toast("Invalid email or password.", "error");
      } else if (msg.includes("rate limit")) {
        toast("Too many attempts. Please wait a moment and try again.", "error");
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        toast("If this email is not already registered, you'll receive a confirmation link shortly.", "success");
      } else {
        toast("An error occurred. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // reset
    // reset

    if (!supabase) {
      toast("Database not configured", "error");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset_password`,
      });
      if (error) throw error;
      toast("If an account exists with this email, you'll receive reset instructions shortly.", "success");
    } catch {
      toast("Failed to send reset email. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // reset
    // reset

    if (!supabase) {
      toast("Database not configured", "error");
      return;
    }

    if (!isPasswordStrong(passwordChecks)) {
      toast("Password doesn't meet all requirements", "error");
      return;
    }

    if (!passwordsMatch) {
      toast("Passwords don't match", "error");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast("Password reset successfully. Redirecting to sign in...", "success");
      setTimeout(() => {
        setAuthMode("signin");
        setPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to reset password.", "error");
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-500" : "text-gray-400"}`}>
      {ok ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
        </svg>
      )}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-slate-900"></div>
        <Image
          src="/Portfolio.jpg"
          alt="TalentAgent"
          fill
          sizes="50vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <LogoFull />
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-3">
              {authMode === "signup"
                ? "Your AI agent is waiting."
                : "Welcome back."}
            </h2>
            <p className="text-gray-300 text-lg max-w-md">
              {authMode === "signup"
                ? "Import your resume, let AI represent you to recruiters, and get matched to jobs honestly."
                : "Your AI agent has been working while you were away. Check your matches and analytics."}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <LogoFull className="[&_text]:fill-gray-900" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-1">
              {authMode === "signin" ? "Sign in" : authMode === "signup" ? "Create account" : authMode === "reset_password" ? "Set new password" : "Reset password"}
            </h1>
            <p className="text-gray-500 text-sm">
              {authMode === "signin" ? "Enter your credentials to continue" : authMode === "signup" ? "Start building your AI-powered profile" : authMode === "reset_password" ? "Choose a strong new password" : "We'll send you a reset link"}
            </p>
          </div>

          {/* Role selector (signup only) */}
          {authMode === "signup" && (
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setSelectedRole("candidate")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedRole === "candidate"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("recruiter")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedRole === "recruiter"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Recruiter
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {selectedRole === "candidate" ? "Find jobs and let your AI agent showcase your work" : "Browse talent, post jobs, and evaluate candidates with AI"}
              </p>
            </div>
          )}

          <form
            onSubmit={
              authMode === "forgot_password" ? handleForgotPassword
              : authMode === "reset_password" ? handlePasswordReset
              : handleEmailAuth
            }
            className="space-y-4"
          >
            {/* Email */}
            {authMode !== "reset_password" && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>
            )}

            {/* Password */}
            {(authMode === "signin" || authMode === "signup" || authMode === "reset_password") && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authMode === "signup" || authMode === "reset_password") setShowPasswordChecks(true);
                    }}
                    required
                    autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    placeholder={authMode === "signin" ? "Enter your password" : "Create a strong password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Password strength checks */}
            {(authMode === "signup" || authMode === "reset_password") && showPasswordChecks && password.length > 0 && (
              <div className="grid grid-cols-2 gap-1 px-1">
                <CheckItem ok={passwordChecks.minLength} label="8+ characters" />
                <CheckItem ok={passwordChecks.hasUpper} label="Uppercase letter" />
                <CheckItem ok={passwordChecks.hasLower} label="Lowercase letter" />
                <CheckItem ok={passwordChecks.hasNumber} label="Number" />
                <CheckItem ok={passwordChecks.hasSpecial} label="Special character" />
              </div>
            )}

            {/* Confirm Password */}
            {(authMode === "signup" || authMode === "reset_password") && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm ${
                      confirmPassword && !passwordsMatch ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-red-500 text-xs mt-1">Passwords don&apos;t match</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (authMode === "signup" && (!isPasswordStrong(passwordChecks) || !passwordsMatch))}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : authMode === "signin" ? "Sign In"
                : authMode === "signup" ? "Create Account"
                : authMode === "reset_password" ? "Set New Password"
                : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {authMode === "signin" && (
              <>
                <button onClick={() => setAuthMode("forgot_password")} className="text-gray-500 hover:text-gray-700 text-sm">
                  Forgot password?
                </button>
                <p className="text-gray-500 text-sm">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setAuthMode("signup")} className="text-brand-600 hover:text-brand-700 font-medium">
                    Sign up
                  </button>
                </p>
              </>
            )}

            {authMode === "signup" && (
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <button onClick={() => setAuthMode("signin")} className="text-brand-600 hover:text-brand-700 font-medium">
                  Sign in
                </button>
              </p>
            )}

            {(authMode === "forgot_password" || authMode === "reset_password") && (
              <button onClick={() => setAuthMode("signin")} className="text-gray-500 hover:text-gray-700 text-sm">
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
