"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  type AuthMode = "signin" | "signup" | "forgot_password" | "reset_password";
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Only redirect if user is signed in and not in reset_password mode
      if (user && authMode !== "reset_password") {
        router.push(redirectTo);
      }
    };

    checkUser();
  }, [redirectTo, router, authMode]);

  useEffect(() => {
    // Check if we're in password reset mode from email link
    const mode = searchParams.get("mode");
    if (mode === "reset_password") {
      setAuthMode("reset_password");
    }
  }, [searchParams]);

  // For debugging - check if Supabase is properly initialized
  useEffect(() => {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    // Don't log the full anon key, just check if it exists
    console.log(
      "Supabase Anon Key exists:",
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setLoading(true);

      if (authMode === "signin") {
        console.log("Attempting to sign in with:", email);
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Sign in error:", error.message);
          throw error;
        }

        console.log("Sign in successful:", !!data.user);
        if (data?.user) {
          router.push(redirectTo);
        }
      } else {
        console.log("Attempting to sign up with:", email);
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error("Sign up error:", error.message);
          throw error;
        }

        console.log("Sign up response:", data);
        if (data?.user?.identities?.length === 0) {
          setErrorMessage(
            "This email is already registered. Please sign in instead."
          );
        } else if (data?.user && !data?.session) {
          setErrorMessage(
            "Please check your email for the confirmation link to complete your registration."
          );
        } else if (data?.session) {
          router.push(redirectTo);
        }
      }
    } catch (error: unknown) {
      console.error("Authentication error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("Email not confirmed")) {
        setErrorMessage(
          "Please check your email and confirm your account before signing in."
        );
      } else if (errorMessage.includes("Invalid login credentials")) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage(
          errorMessage || "An error occurred during authentication"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset_password`,
      });

      if (error) throw error;

      setSuccessMessage(
        "Password reset instructions have been sent to your email. Please check your inbox."
      );
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage("Failed to send reset password email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccessMessage(
        "Password has been successfully reset. You can now sign in with your new password."
      );
      // Switch back to signin mode after successful reset
      setTimeout(() => {
        setAuthMode("signin");
        setPassword("");
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gray-50"></div>
        <Image
          src="/Portfolio.jpg"
          alt="Portfolio Hub"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <h2 className="text-3xl font-light mb-4">Welcome to PortfolioHub</h2>
          <p className="text-gray-200 text-lg">
            Showcase your work, connect with professionals, and grow your
            career.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-light text-gray-900 mb-2">
                {authMode === "signin"
                  ? "Welcome Back"
                  : authMode === "signup"
                  ? "Create Account"
                  : authMode === "reset_password"
                  ? "Set New Password"
                  : "Reset Password"}
              </h1>
              <p className="text-gray-600">
                {authMode === "signin"
                  ? "Sign in to your account"
                  : authMode === "signup"
                  ? "Join our community of professionals"
                  : authMode === "reset_password"
                  ? "Enter your new password"
                  : "Enter your email to reset your password"}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            <form
              onSubmit={
                authMode === "forgot_password"
                  ? handleForgotPassword
                  : authMode === "reset_password"
                  ? handlePasswordReset
                  : handleEmailAuth
              }
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {(authMode === "signin" ||
                authMode === "signup" ||
                authMode === "reset_password") && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={authMode === "reset_password" ? "new-password" : "current-password"}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : authMode === "signin" ? (
                  "Sign In"
                ) : authMode === "signup" ? (
                  "Sign Up"
                ) : authMode === "reset_password" ? (
                  "Set New Password"
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              {authMode === "signin" && (
                <>
                  <button
                    onClick={() => setAuthMode("forgot_password")}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Forgot your password?
                  </button>
                  <p className="text-gray-400 text-sm">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => setAuthMode("signup")}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {authMode === "signup" && (
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setAuthMode("signin")}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {(authMode === "forgot_password" ||
                authMode === "reset_password") && (
                <button
                  onClick={() => setAuthMode("signin")}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
