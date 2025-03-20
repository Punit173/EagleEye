import React from 'react';
import { Link } from 'react-router-dom';
import video from '../assets/stock-footage-ai-powered-mock-up-cctv-footage-in-supermarket-people-shopping-in-a-grocery-store-multiple-camera.webm'

const Home = () => {
  const features = [
    {
      title: "Real-time Analysis",
      description: "Instant detection and analysis of security events using advanced AI algorithms",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "AI-Powered Detection",
      description: "Advanced machine learning models for accurate threat detection and object recognition",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "24/7 Monitoring",
      description: "Continuous surveillance with automated alerts for suspicious activities",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Smart Analytics",
      description: "Comprehensive reporting and analytics dashboard for security insights",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1F2E] text-white relative">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/path-to-your-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

      {/* Hero Section */}
      <div className="relative overflow-hidden z-20">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00B4D8]/10 to-transparent"></div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00B4D8] to-[#023E7A]">
              Next-Gen Video Surveillance
            </h1>
            <p className="text-xl text-[#94A3B8] mb-8">
              Advanced AI-powered video analysis system for enhanced security and real-time threat detection
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-3 bg-gradient-to-r from-[#00B4D8] to-[#023E7A] rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Access System
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3 border border-[#00B4D8] rounded-lg font-medium hover:bg-[#00B4D8]/10 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-[#2A3142] border border-[#3B4251] hover:border-[#00B4D8] transition-colors"
            >
              <div className="w-12 h-12 bg-[#00B4D8]/20 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-[#94A3B8]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00B4D8] mb-2">99.9%</div>
            <div className="text-[#94A3B8]">Detection Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00B4D8] mb-2">24/7</div>
            <div className="text-[#94A3B8]">Continuous Monitoring</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00B4D8] mb-2">0.1s</div>
            <div className="text-[#94A3B8]">Response Time</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Enhance Your Security?</h2>
          <p className="text-[#94A3B8] mb-8">
            Join leading organizations in implementing next-generation video surveillance
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#00B4D8] to-[#023E7A] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#3B4251] py-8">
        <div className="container mx-auto px-4 text-center text-[#94A3B8]">
          <p>© 2024 EagleEye. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;