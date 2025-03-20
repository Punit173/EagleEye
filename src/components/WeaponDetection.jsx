// src/components/WeaponDetection.jsx
import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { Camera, CameraOff, AlertTriangle, Shield } from "lucide-react";

const WeaponDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [detectedWeapons, setDetectedWeapons] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    // Load the COCO-SSD model
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
      setIsModelLoading(false);
      console.log("Model loaded successfully.");
    });
  }, []);

  const startCamera = async () => {
    setIsCameraOn(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      detectObjects();
    }
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  const detectObjects = async () => {
    if (!model) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const detect = async () => {
      if (!video || !isCameraOn) return;

      const predictions = await model.detect(video);
      const weapons = predictions.filter(pred =>
        pred.class === "knife" || pred.class === "gun"
      );

      setDetectedWeapons(weapons);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;
        const isWeapon = prediction.class === "knife" || prediction.class === "gun";
        const color = isWeapon ? "#EF4444" : "#10B981";

        // Draw semi-transparent background for text
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(x, y - 30, 200, 25);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = color;
        ctx.font = "bold 14px Arial";
        ctx.fillText(
          `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
          x + 5,
          y - 10
        );
      });

      requestAnimationFrame(detect);
    };

    detect();
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className={`space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 text-transparent bg-clip-text animate-gradient mb-4">
              Weapon Detection System
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time weapon detection powered by AI
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl transform rotate-2 scale-105"></div>
                <div className="relative p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-xl">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700/50">
                    <video
                      ref={videoRef}
                      className={`absolute inset-0 w-full h-full object-cover ${isCameraOn ? "block" : "hidden"}`}
                      width="640"
                      height="480"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                      width="640"
                      height="480"
                    />
                    {!isCameraOn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Camera is currently off</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${detectedWeapons.length > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                        {detectedWeapons.length > 0 ? (
                          <AlertTriangle className="w-6 h-6 text-rose-500" />
                        ) : (
                          <Shield className="w-6 h-6 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Detection Status</h2>
                        <p className={`text-lg ${detectedWeapons.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {detectedWeapons.length > 0
                            ? `${detectedWeapons.length} weapon${detectedWeapons.length > 1 ? 's' : ''} detected!`
                            : 'No weapons detected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={isCameraOn ? stopCamera : startCamera}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center ${isCameraOn
                          ? 'bg-rose-500 hover:bg-rose-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                    >
                      {isCameraOn ? (
                        <>
                          <CameraOff className="mr-2" />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2" />
                          Start Camera
                        </>
                      )}
                    </button>
                  </div>

                  {isModelLoading && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-blue-400">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Loading AI model...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detection Info */}
            <div className="lg:col-span-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl transform rotate-2 scale-105"></div>
                <div className="relative bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6">Detection Information</h2>

                  <div className="space-y-6">
                    <div className="p-4 rounded-lg  border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-2">Current Status</h3>
                      <p className="text-gray-400">
                        Camera: <span className={isCameraOn ? "text-emerald-400" : "text-rose-400"}>
                          {isCameraOn ? "Active" : "Inactive"}
                        </span>
                      </p>
                      <p className="text-gray-400 mt-2">
                        AI Model: <span className={model ? "text-emerald-400" : "text-amber-400"}>
                          {model ? "Loaded" : "Loading..."}
                        </span>
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-2">Detection Capabilities</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          Knife Detection
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          Gun Detection
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          Real-time Analysis
                        </li>
                      </ul>
                    </div>

                    {detectedWeapons.length > 0 && (
                      <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <h3 className="text-lg font-semibold text-rose-500 mb-2">Active Alerts</h3>
                        <ul className="space-y-2">
                          {detectedWeapons.map((weapon, index) => (
                            <li key={index} className="text-rose-400">
                              {weapon.class} ({(weapon.score * 100).toFixed(1)}% confidence)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 8s ease infinite;
  }
`;
document.head.appendChild(style);

export default WeaponDetection;
