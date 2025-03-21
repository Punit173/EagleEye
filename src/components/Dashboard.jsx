import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Suspicious Activity Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="w-full md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold text-white mb-4">
              Suspicious Activity Detection
            </h2>
            <p className="text-gray-300 mb-6">
              Monitor and detect suspicious behaviors in real-time using advanced AI.
              Track activities like running, quick exits, and unusual movements to enhance security.
            </p>
            <Link
              to="/sadetect"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Launch Detector
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://i.pinimg.com/736x/b1/03/3b/b1033b60d9a0f99f16c4abc96eaaca0f.jpg"
                alt="Suspicious Activity Detection"
                className="w-full h-[300px] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdXNwaWNpb3VzIEFjdGl2aXR5IERldGVjdGlvbjwvdGV4dD48L3N2Zz4='
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Stampede Detection Section */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
          <div className="w-full md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stampede Detection
            </h2>
            <p className="text-gray-300 mb-6">
              Prevent dangerous crowd situations with real-time stampede detection.
              Monitor crowd density and movement patterns to ensure public safety.
            </p>
            <Link
              to="/objdetect"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Launch Detector
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://i.pinimg.com/736x/8e/8f/58/8e8f584efb204458cbf7e291994377cd.jpg"
                alt="Stampede Detection"
                className="w-full h-[300px] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdGFtcGVkZSBEZXRlY3Rpb248L3RleHQ+PC9zdmc+'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Violence Detection Section */}
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold text-white mb-4">
              Violence Detection
            </h2>
            <p className="text-gray-300 mb-6">
              Quickly identify and respond to violent incidents using AI-powered detection.
              Enhance security measures and response times in critical situations.
            </p>
            <Link
              to="/violence"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Launch Detector
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://i.pinimg.com/736x/17/8b/cb/178bcb83c127d384caf372fbc2c1f22f.jpg"
                alt="Violence Detection"
                className="w-full h-[300px] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WaW9sZW5jZSBEZXRlY3Rpb248L3RleHQ+PC9zdmc+'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
