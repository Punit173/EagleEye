import React, { useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const colors = {
    primary: "#1A1F2E",      // Dark Background
    secondary: "#2A3142",    // Card Background
    accent: "#00B4D8",       // Primary Accent (Security Blue)
    accentSecondary: "#023E7A", // Secondary Accent
    textPrimary: "#E2E8F0",  // Light Text
    textSecondary: "#94A3B8", // Muted Text
    border: "#3B4251",       // Border Color
    success: "#00C853",      // Success Green
    error: "#FF3D00",        // Error Red
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1A1F2E] relative overflow-hidden">
      {/* Surveillance-themed background elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#00B4D8]/10 to-transparent"></div>

      {/* Animated camera lens effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-4 border-[#00B4D8]/20 animate-pulse"></div>

      <div className="w-full max-w-md rounded-xl shadow-2xl p-8 relative overflow-hidden backdrop-blur-sm bg-[#2A3142]/90 border border-[#3B4251]">
        {/* Security-themed decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00B4D8] to-[#023E7A]"></div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#00B4D8]/10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#023E7A]/10 rounded-tr-full"></div>

        {/* Header with security icon */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-16 h-16 bg-[#00B4D8]/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#00B4D8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2">EagleEye</h1>
          <p className="text-[#94A3B8] text-sm">Automated Video Analysis System</p>
        </div>

        {error && (
          <div className="bg-[#FF3D00]/10 text-[#FF3D00] p-3 rounded-lg mb-4 border border-[#FF3D00]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#E2E8F0] mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 rounded-lg bg-[#1A1F2E] border border-[#3B4251] text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#E2E8F0]">
                Password
              </label>
              <a href="/forgot-password" className="text-sm text-[#00B4D8] hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 rounded-lg bg-[#1A1F2E] border border-[#3B4251] text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#00B4D8] to-[#023E7A] text-white font-medium hover:opacity-90 transition-opacity duration-300 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? "Authenticating..." : "Access System"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#94A3B8] text-sm">
            Need system access?{" "}
            <a href="/register" className="text-[#00B4D8] hover:underline">
              Request credentials
            </a>
          </p>
        </div>

        {/* Security-themed decorative elements */}
        <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#00C853] animate-pulse"></div>
        <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse"></div>
      </div>
    </div>
  );
};

export default Login;