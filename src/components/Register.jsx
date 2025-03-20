import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Animated background shapes
  const shapes = [
    { size: 60, delay: 0, duration: 20 },
    { size: 120, delay: 5, duration: 25 },
    { size: 80, delay: 10, duration: 22 },
    { size: 100, delay: 15, duration: 28 },
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const user = signUpData?.user;
      if (!user) {
        setError("Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("users")
        .insert({
          user_id: user.id,
          name: name,
          email: email,
          company_name: companyName,
          role: role
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Registration failed:", err);
      setError("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {shapes.map((shape, index) => (
          <div
            key={index}
            className="absolute rounded-full mix-blend-screen animate-float opacity-20"
            style={{
              width: shape.size + 'px',
              height: shape.size + 'px',
              background: `radial-gradient(circle at center, ${index % 2 ? '#4F46E5' : '#06B6D4'}, transparent)`,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: shape.delay + 's',
              animationDuration: shape.duration + 's',
            }}
          />
        ))}
      </div>

      {/* Left Panel - Branding */}
      <div className={`lg:w-1/2 relative overflow-hidden hidden lg:block transition-transform duration-1000 ${mounted ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center px-12 py-24">
          <div className={`mb-12 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 text-transparent bg-clip-text mb-4 animate-gradient">
              EagleEye Surveillance
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Join the future of intelligent video surveillance. Transform your security infrastructure with AI-powered analytics and real-time monitoring.
            </p>
          </div>

          <div className="space-y-8">
            {['Enterprise-Grade Security', 'Real-time Analytics', '24/7 Monitoring'].map((feature, index) => (
              <div
                key={feature}
                className={`flex items-start space-x-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                style={{ transitionDelay: `${(index + 2) * 200}ms` }}
              >
                <div className={`p-2 rounded-lg transform transition-transform hover:scale-110 ${index === 0 ? 'bg-emerald-500/10' :
                    index === 1 ? 'bg-blue-500/10' : 'bg-purple-500/10'
                  }`}>
                  <svg className={`w-6 h-6 ${index === 0 ? 'text-emerald-400' :
                      index === 1 ? 'text-blue-400' : 'text-purple-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                    {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                    {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                  </svg>
                </div>
                <div className="group cursor-default">
                  <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">{feature}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {index === 0 && "Advanced encryption and secure access controls"}
                    {index === 1 && "Comprehensive insights and reporting"}
                    {index === 2 && "Continuous surveillance and instant alerts"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className={`lg:w-1/2 flex items-center justify-center p-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
        <div className="w-full max-w-md relative">
          {/* Glassmorphism card effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl transform rotate-2 scale-105"></div>

          <div className="relative bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 animate-gradient bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">
                Create Account
              </h2>
              <p className="text-gray-400">Start securing your premises today</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-800/50 text-red-300 animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-emerald-900/30 border border-emerald-800/50 text-emerald-300 animate-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              {[
                { label: "Full Name", type: "text", value: name, onChange: setName, placeholder: "Enter your full name" },
                { label: "Company Name", type: "text", value: companyName, onChange: setCompanyName, placeholder: "Enter your company name" },
                { label: "Email Address", type: "email", value: email, onChange: setEmail, placeholder: "Enter your email" },
                { label: "Password", type: "password", value: password, onChange: setPassword, placeholder: "Create a password" },
                { label: "Confirm Password", type: "password", value: confirmPassword, onChange: setConfirmPassword, placeholder: "Confirm your password" }
              ].map((field, index) => (
                <div
                  key={field.label}
                  className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-gray-800/70"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    required
                  />
                </div>
              ))}

              <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: '500ms' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-gray-800/70"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select your role</option>
                  <option value="security_manager">Security Manager</option>
                  <option value="system_admin">System Administrator</option>
                  <option value="operator">Security Operator</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-4 px-6 rounded-lg bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white font-medium text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: '600ms' }}
                disabled={loading}
              >
                <div className="relative flex items-center justify-center">
                  <span className={`transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                    Create Account
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </form>

            <div className={`mt-8 text-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '700ms' }}>
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these styles to your CSS/Tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(10px, -10px) rotate(5deg); }
    50% { transform: translate(0, -20px) rotate(0deg); }
    75% { transform: translate(-10px, -10px) rotate(-5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes success {
    0% { transform: scale(0.95); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .animate-float {
    animation: float 20s infinite ease-in-out;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 8s ease infinite;
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  .animate-success {
    animation: success 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);

export default Register;