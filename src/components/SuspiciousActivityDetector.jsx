import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Activity, AlertTriangle, Brain, Zap, Shield, AlertCircle } from 'lucide-react';

const SuspiciousActivityDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [detector, setDetector] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const poseDetector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      setDetector(poseDetector);
      setLoading(false);
    };

    loadModel();
  }, []);

  useEffect(() => {
    const enableCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    };

    enableCamera();
  }, []);

  useEffect(() => {
    // Process each video frame for pose detection
    const detectPoses = async () => {
      if (!isMonitoring || !detector || !videoRef.current || videoRef.current.readyState !== 4) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const poses = await detector.estimatePoses(video);

      // Clear the canvas and draw video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw poses with modern styling
      poses.forEach((pose) => {
        // Draw keypoints
        pose.keypoints.forEach((keypoint) => {
          if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });

        // Draw connections
        pose.keypoints.forEach((keypoint, i) => {
          if (keypoint.score > 0.5) {
            const connections = pose.keypoints.filter((kp, j) => j > i && kp.score > 0.5);
            connections.forEach((connection) => {
              ctx.beginPath();
              ctx.moveTo(keypoint.x, keypoint.y);
              ctx.lineTo(connection.x, connection.y);
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
              ctx.lineWidth = 2;
              ctx.stroke();
            });
          }
        });
      });

      // Add your custom suspicious activity detection logic here
      // For example, detect unusual poses or movements
      const suspiciousPoses = poses.filter(pose => {
        // Add your detection logic here
        return false;
      });

      if (suspiciousPoses.length > 0) {
        setSuspiciousActivities(prev => [...prev, {
          timestamp: new Date(),
          count: suspiciousPoses.length
        }]);
      }

      requestAnimationFrame(detectPoses);
    };

    if (detector) {
      detectPoses();
    }
  }, [detector, isMonitoring]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(16,185,129,0.05),rgba(59,130,246,0.05),rgba(139,92,246,0.05))]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className={`space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header with Stats */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500">
                Suspicious Activity Detector
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real-time pose detection and suspicious activity monitoring using TensorFlow.js
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <Activity className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{suspiciousActivities.length}</h3>
                <p className="text-gray-400">Detections</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">17</h3>
                <p className="text-gray-400">Keypoints</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">30fps</h3>
                <p className="text-gray-400">Processing Rate</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl transform rotate-2 scale-105 transition-transform duration-300 group-hover:scale-110"></div>
                <div className="relative bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-xl">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700/50 group-hover:border-emerald-500/50 transition-colors duration-300">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  {/* Status and Controls */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-xl transition-all duration-300 ${
                        suspiciousActivities.length > 0 
                          ? 'bg-rose-500/10 border border-rose-500/20' 
                          : 'bg-emerald-500/10 border border-emerald-500/20'
                      }`}>
                        {suspiciousActivities.length > 0 ? (
                          <AlertTriangle className="w-8 h-8 text-rose-500" />
                        ) : (
                          <Shield className="w-8 h-8 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Detection Status</h2>
                        <p className={`text-lg font-medium ${
                          suspiciousActivities.length > 0 ? 'text-rose-500' : 'text-emerald-500'
                        }`}>
                          {suspiciousActivities.length > 0
                            ? `${suspiciousActivities.length} suspicious activity${suspiciousActivities.length > 1 ? 'ies' : ''} detected!`
                            : 'No suspicious activities detected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMonitoring(prev => !prev)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center ${
                        isMonitoring
                          ? 'bg-rose-500 hover:bg-rose-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {isMonitoring ? (
                        <>
                          <Activity className="mr-2" />
                          Pause Monitoring
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2" />
                          Resume Monitoring
                        </>
                      )}
                    </button>
                  </div>

                  {/* Model Status */}
                  {loading && (
                    <div className="mt-6 p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                        <span className="text-gray-300 font-medium">Loading model, please wait...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Detection Capabilities */}
              <div className="p-6 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 text-emerald-500 mr-2" />
                  Detection Capabilities
                </h3>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <span className="w-2 h-2 bg-rose-500 rounded-full mr-3"></span>
                    Unusual Body Movements
                  </li>
                  <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Abnormal Pose Patterns
                  </li>
                  <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Rapid Position Changes
                  </li>
                  <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                    Real-time Analysis
                  </li>
                </ul>
              </div>

              {/* Recent Detections */}
              <div className="p-6 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-rose-500 mr-2" />
                  Recent Detections
                </h3>
                <div className="space-y-3">
                  {suspiciousActivities.slice(-5).map((activity, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gray-700/30 border border-rose-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-rose-500 font-medium">
                          {activity.count} detection{activity.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  {suspiciousActivities.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No recent detections</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspiciousActivityDetection;
