import React, { useEffect, useRef, useState } from "react";
import { WeaponDetectionModel } from "../models/WeaponDetectionModel";
import { Camera, CameraOff, AlertTriangle, Shield, RefreshCw, Brain, Zap, Settings, Activity, BarChart2, Target } from "lucide-react";

const CustomWeaponDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [detectedWeapons, setDetectedWeapons] = useState([]);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [modelStatus, setModelStatus] = useState('loading');
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);

    useEffect(() => {
        setMounted(true);
        initializeModel();
        return () => setMounted(false);
    }, []);

    const initializeModel = async () => {
        try {
            const weaponModel = new WeaponDetectionModel();
            const modelLoaded = await weaponModel.loadModel();

            if (!modelLoaded) {
                console.log('Building new model...');
                await weaponModel.buildModel();
                setModelStatus('new');
            } else {
                setModelStatus('loaded');
            }

            setModel(weaponModel);
            setIsModelLoading(false);
        } catch (error) {
            console.error('Error initializing model:', error);
            setModelStatus('error');
            setIsModelLoading(false);
        }
    };

    const getAvailableCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setAvailableCameras(videoDevices);

            const defaultCamera = videoDevices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('environment')
            ) || videoDevices[0];

            setSelectedCamera(defaultCamera?.deviceId || null);
        } catch (error) {
            console.error('Error getting camera list:', error);
            setCameraError('Failed to get camera list');
        }
    };

    useEffect(() => {
        getAvailableCameras();
    }, []);

    const startCamera = async () => {
        setIsCameraOn(true);
        setCameraError(null);

        if (!selectedCamera) {
            setCameraError('No camera selected');
            setIsCameraOn(false);
            return;
        }

        try {
            const constraints = {
                video: {
                    deviceId: { exact: selectedCamera },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 },
                    exposureMode: "continuous",
                    focusMode: "continuous",
                    whiteBalanceMode: "continuous",
                    advanced: [
                        { brightness: 1.2 },
                        { contrast: 1.1 },
                        { saturation: 1.1 }
                    ]
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            detectObjects();
        } catch (error) {
            console.error('Error accessing camera:', error);
            setCameraError(error.message);
            setIsCameraOn(false);
        }
    };

    const stopCamera = () => {
        setIsCameraOn(false);
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const switchCamera = async () => {
        stopCamera();
        const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCamera);
        const nextIndex = (currentIndex + 1) % availableCameras.length;
        setSelectedCamera(availableCameras[nextIndex].deviceId);
        await startCamera();
    };

    const detectObjects = async () => {
        if (!model || !isCameraOn) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const detect = async () => {
            if (!video || !isCameraOn) return;

            // Draw and enhance the video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            try {
                const predictions = await model.predict(canvas);

                // Filter weapons based on confidence threshold
                const weapons = predictions.filter(pred =>
                    pred.probability >= confidenceThreshold
                );

                setDetectedWeapons(weapons);

                // Draw predictions
                predictions.forEach((pred) => {
                    const { class: className, probability } = pred;
                    const isWeapon = probability >= confidenceThreshold;

                    // Draw bounding box (you'll need to implement object detection for this)
                    // For now, we'll just show the prediction text
                    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    ctx.fillRect(10, 10, 200, 25);

                    ctx.fillStyle = isWeapon ? "#EF4444" : "#10B981";
                    ctx.font = "bold 14px Arial";
                    ctx.fillText(
                        `${className} (${(probability * 100).toFixed(1)}%)`,
                        15,
                        30
                    );

                    if (isWeapon) {
                        ctx.fillStyle = "#EF4444";
                        ctx.font = "bold 16px Arial";
                        ctx.fillText("⚠️ WEAPON DETECTED!", 10, 60);
                    }
                });
            } catch (error) {
                console.error('Error during detection:', error);
            }

            requestAnimationFrame(detect);
        };

        detect();
    };

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
                                Weapon Detection System
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Advanced AI-powered real-time weapon detection using TensorFlow.js
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <Activity className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <h3 className="text-2xl font-bold text-white">{detectedWeapons.length}</h3>
                                <p className="text-gray-400">Detections</p>
                            </div>
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <h3 className="text-2xl font-bold text-white">{(confidenceThreshold * 100).toFixed(0)}%</h3>
                                <p className="text-gray-400">Sensitivity</p>
                            </div>
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <BarChart2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <h3 className="text-2xl font-bold text-white">15</h3>
                                <p className="text-gray-400">Categories</p>
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
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
                                                <div className="text-center">
                                                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-400 text-lg">Camera is currently off</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Camera Controls */}
                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-4 rounded-xl transition-all duration-300 ${detectedWeapons.length > 0
                                                    ? 'bg-rose-500/10 border border-rose-500/20'
                                                    : 'bg-emerald-500/10 border border-emerald-500/20'
                                                }`}>
                                                {detectedWeapons.length > 0 ? (
                                                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                                                ) : (
                                                    <Shield className="w-8 h-8 text-emerald-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-1">Detection Status</h2>
                                                <p className={`text-lg font-medium ${detectedWeapons.length > 0 ? 'text-rose-500' : 'text-emerald-500'
                                                    }`}>
                                                    {detectedWeapons.length > 0
                                                        ? `${detectedWeapons.length} weapon${detectedWeapons.length > 1 ? 's' : ''} detected!`
                                                        : 'No weapons detected'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            {availableCameras.length > 1 && (
                                                <button
                                                    onClick={switchCamera}
                                                    className="p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 transition-all duration-300 hover:scale-105"
                                                    title="Switch Camera"
                                                >
                                                    <RefreshCw className="w-6 h-6 text-white" />
                                                </button>
                                            )}
                                            <button
                                                onClick={isCameraOn ? stopCamera : startCamera}
                                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center ${isCameraOn
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
                                    </div>

                                    {/* Model Status */}
                                    <div className="mt-6 p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                                        <div className="flex items-center space-x-3">
                                            <Brain className="w-6 h-6 text-blue-400" />
                                            <span className="text-gray-300 font-medium">Model Status:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${modelStatus === 'loaded' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    modelStatus === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                                        modelStatus === 'error' ? 'bg-rose-500/20 text-rose-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {modelStatus === 'loaded' ? 'Loaded from storage' :
                                                    modelStatus === 'new' ? 'New model built' :
                                                        modelStatus === 'error' ? 'Error loading model' :
                                                            'Loading...'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confidence Threshold Slider */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Detection Sensitivity
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="0.9"
                                                step="0.1"
                                                value={confidenceThreshold}
                                                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <span className="text-white font-medium min-w-[4rem] text-right">
                                                {(confidenceThreshold * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Camera Error Display */}
                                    {cameraError && (
                                        <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                            <p className="text-rose-400 font-medium">Camera Error: {cameraError}</p>
                                        </div>
                                    )}

                                    {/* Camera Selection */}
                                    {availableCameras.length > 1 && (
                                        <div className="mt-6">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Select Camera
                                            </label>
                                            <select
                                                value={selectedCamera || ''}
                                                onChange={(e) => setSelectedCamera(e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            >
                                                {availableCameras.map((camera) => (
                                                    <option key={camera.deviceId} value={camera.deviceId}>
                                                        {camera.label || `Camera ${camera.deviceId.slice(0, 4)}`}
                                                    </option>
                                                ))}
                                            </select>
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
                                    <Target className="w-5 h-5 text-emerald-500 mr-2" />
                                    Detection Capabilities
                                </h3>
                                <ul className="space-y-3 text-gray-400">
                                    <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                        <span className="w-2 h-2 bg-rose-500 rounded-full mr-3"></span>
                                        Lethal Weapons (Knives, Guns, Rifles)
                                    </li>
                                    <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                                        Sharp Objects (Scissors, Swords)
                                    </li>
                                    <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                        Blunt Weapons (Bats, Golf Clubs)
                                    </li>
                                    <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                                        Improvised Weapons (Bottles, Chairs)
                                    </li>
                                    <li className="flex items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                        Real-time Analysis
                                    </li>
                                </ul>
                            </div>

                            {/* Model Information */}
                            <div className="p-6 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <Settings className="w-5 h-5 text-blue-500 mr-2" />
                                    Model Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center p-3 rounded-lg bg-gray-700/30">
                                        <Zap className="w-5 h-5 text-blue-400 mr-3" />
                                        <span className="text-gray-300">Custom TensorFlow.js CNN Model</span>
                                    </div>
                                    <div className="flex items-center p-3 rounded-lg bg-gray-700/30">
                                        <Brain className="w-5 h-5 text-purple-400 mr-3" />
                                        <span className="text-gray-300">15 Weapon Categories</span>
                                    </div>
                                    <div className="flex items-center p-3 rounded-lg bg-gray-700/30">
                                        <Shield className="w-5 h-5 text-emerald-400 mr-3" />
                                        <span className="text-gray-300">Real-time Detection</span>
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

export default CustomWeaponDetection; 