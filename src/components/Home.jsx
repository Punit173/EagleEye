import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import video from '../assets/173103-848555583_medium.mp4'

const LandingPage = () => {
  const [mounted, setMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

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
    { size: 90, delay: 8, duration: 24 },
    { size: 70, delay: 12, duration: 26 },
  ];

  const features = [
    {
      title: "Real-time Analytics",
      description: "Advanced AI-powered analytics for instant insights and monitoring",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      )
    },
    {
      title: "Smart Detection",
      description: "Intelligent object and behavior detection with high accuracy",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      )
    },
    {
      title: "Enterprise Security",
      description: "Military-grade encryption and secure access controls",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      )
    },
    {
      title: "24/7 Monitoring",
      description: "Round-the-clock surveillance with instant alerts",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    },
    {
      title: "Custom Reports",
      description: "Detailed analytics and customizable reporting dashboards",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      )
    },
    {
      title: "Cloud Storage",
      description: "Secure cloud storage with instant access to footage",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      )
    }
  ];

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`object-cover w-full h-full ${videoLoaded ? 'opacity-90' : 'opacity-0'} transition-opacity duration-1000`}
          onLoadedData={handleVideoLoaded}
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/90"></div>
      </div>

      {/* Animated Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 z-20">
        <div className="max-w-7xl mx-auto text-center relative">
          <div className={`space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 text-transparent bg-clip-text animate-gradient">
              EagleEye Surveillance
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform your security infrastructure with AI-powered video analytics and real-time monitoring
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                to="/register"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white font-medium text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl w-full sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                to="/demo"
                className="px-8 py-4 rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-white font-medium text-lg transition-all duration-300 hover:bg-gray-800/80 w-full sm:w-auto group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Watch Demo
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-300 text-lg">Advanced surveillance capabilities powered by cutting-edge AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 rounded-2xl backdrop-blur-sm border border-gray-700/50 bg-gray-800/30 transition-all duration-700 hover:bg-gray-800/50 hover:scale-[1.02] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center ${index % 3 === 0 ? 'bg-emerald-500/10' :
                    index % 3 === 1 ? 'bg-blue-500/10' : 'bg-purple-500/10'
                  }`}>
                  <svg className={`w-6 h-6 ${index % 3 === 0 ? 'text-emerald-400' :
                      index % 3 === 1 ? 'text-blue-400' : 'text-purple-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 z-20">
        <div className="max-w-4xl mx-auto backdrop-blur-sm bg-gray-900/30 p-8 rounded-2xl border border-gray-800/50">
          <div className={`space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} text-center`}>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Security?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of businesses that trust EagleEye for their surveillance needs
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white font-medium text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl w-full sm:w-auto"
              >
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 rounded-lg border border-gray-700 bg-gray-800/50 text-white font-medium text-lg transition-all duration-300 hover:bg-gray-800/80 w-full sm:w-auto"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
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

  .animate-float {
    animation: float 20s infinite ease-in-out;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 8s ease infinite;
  }
`;
document.head.appendChild(style);

export default LandingPage;