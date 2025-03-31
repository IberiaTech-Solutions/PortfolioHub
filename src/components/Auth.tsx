"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push(redirectTo);
      }
    };

    checkUser();
  }, [redirectTo, router]);

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

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">
        {authMode === "signin" ? "Sign In" : "Sign Up"}
      </h1>

      {errorMessage && (
        <div className="w-full p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleEmailAuth}
        className="flex flex-col space-y-4 w-full"
      >
        <input
          type="email"
          placeholder="Your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Your password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          minLength={6}
        />
        <p className="text-xs text-gray-500">
          Password must be at least 6 characters
        </p>

        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : authMode === "signin"
            ? "Sign In"
            : "Sign Up"}
        </button>
      </form>

      <div className="text-sm text-center">
        {authMode === "signin" ? (
          <p>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => {
                setAuthMode("signup");
                setErrorMessage(null);
              }}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage(null);
              }}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
