import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import Webcam from "react-webcam";
import { FiVideo, FiAlertTriangle, FiCheck, FiPhone, FiMail, FiCamera, FiPause, FiPlay } from "react-icons/fi";

const ViolenceDetection = () => {
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDetecting, setIsDetecting] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [detectionHistory, setDetectionHistory] = useState([]);
    const webcamRef = useRef(null);
    const monitoringInterval = useRef(null);

    const VIOLENCE_INDICATORS = {
        PHYSICAL_VIOLENCE: [
            'fight', 'fighting', 'violent', 'violence',
            'punch', 'punching', 'kick', 'kicking',
            'strike', 'striking', 'hit', 'hitting',
            'assault', 'attacking', 'attack'
        ],
        WEAPONS: [
            'weapon', 'knife', 'gun', 'firearm',
            'blade', 'stick', 'bat', 'club'
        ],
        AGGRESSIVE_BEHAVIOR: [
            'aggressive', 'threatening', 'threat',
            'confrontation', 'altercation', 'brawl'
        ]
    };

    useEffect(() => {
        const loadModel = async () => {
            try {
                const loadedModel = await mobilenet.load();
                setModel(loadedModel);
                setLoading(false);
            } catch (error) {
                console.error("Error loading model:", error);
            }
        };
        loadModel();

        return () => {
            if (monitoringInterval.current) {
                clearInterval(monitoringInterval.current);
            }
        };
    }, []);

    const detectViolenceType = (predictions) => {
        let highestConfidence = 0;
        let detectedType = null;
        let detectedCategory = null;

        for (const prediction of predictions) {
            const className = prediction.className.toLowerCase();

            // Check each category of violence
            for (const [category, indicators] of Object.entries(VIOLENCE_INDICATORS)) {
                if (indicators.some(indicator => className.includes(indicator))) {
                    if (prediction.probability > highestConfidence) {
                        highestConfidence = prediction.probability;
                        detectedType = prediction.className;
                        detectedCategory = category;
                    }
                }
            }
        }

        return detectedType ? {
            detected: true,
            className: detectedType,
            confidence: highestConfidence,
            category: detectedCategory
        } : null;
    };

    const handlePredict = async () => {
        if (!model || !webcamRef.current) return;

        setIsDetecting(true);
        const video = webcamRef.current.video;

        try {
            const tensor = tf.browser.fromPixels(video);
            const predictions = await model.classify(tensor);

            const violenceResult = detectViolenceType(predictions);

            const newPrediction = violenceResult || {
                detected: false,
                className: "No violence detected",
                confidence: 0,
                category: null,
                timestamp: new Date().toISOString()
            };

            setPrediction(newPrediction);
            if (newPrediction.detected) {
                setDetectionHistory(prev => [...prev, newPrediction].slice(-5));
            }
        } catch (error) {
            console.error("Prediction error:", error);
        } finally {
            setIsDetecting(false);
        }
    };

    const toggleMonitoring = () => {
        if (isMonitoring) {
            clearInterval(monitoringInterval.current);
            setIsMonitoring(false);
        } else {
            handlePredict(); // Initial detection
            monitoringInterval.current = setInterval(handlePredict, 3000); // Check every 3 seconds
            setIsMonitoring(true);
        }
    };

    const getRecommendedActions = () => {
        if (!prediction?.detected) return [];

        const confidence = prediction.confidence;
        const category = prediction.category;

        const actions = [
            {
                icon: <FiPhone />,
                title: "Contact Security",
                description: category === 'WEAPONS' ?
                    "Immediate security response required" :
                    "Alert nearby security personnel",
                severity: category === 'WEAPONS' ? "critical" : "high",
                button: "Call Now"
            },
            {
                icon: <FiCamera />,
                title: "Record Evidence",
                description: "Capture and save video evidence",
                severity: "medium",
                button: "Record"
            },
            {
                icon: <FiMail />,
                title: "Report Incident",
                description: `Report ${category?.toLowerCase().replace('_', ' ')} incident`,
                severity: "medium",
                button: "Report"
            }
        ];

        // Show all actions for weapons or high confidence
        if (category === 'WEAPONS' || confidence > 0.7) {
            return actions;
        }
        // Show only recording and reporting for lower confidence
        return actions.slice(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-white">
                        Violence Detection System
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleMonitoring}
                            disabled={loading}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${loading ? "bg-gray-700 cursor-not-allowed" :
                                isMonitoring ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                } text-white`}
                        >
                            {isMonitoring ? (
                                <>
                                    <FiPause className="mr-2" />
                                    Stop Monitoring
                                </>
                            ) : (
                                <>
                                    <FiPlay className="mr-2" />
                                    Start Monitoring
                                </>
                            )}
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                            <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-500" : "bg-green-500"} animate-pulse`} />
                            <span className="text-sm text-gray-300">
                                {loading ? "Loading model..." : "Model ready"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Video Feed Section */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    className="w-full h-full object-cover"
                                    videoConstraints={{
                                        facingMode: "user",
                                    }}
                                />
                            )}
                            {isMonitoring && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs text-white font-medium">Monitoring Active</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-400">Live Feed</span>
                            <button
                                onClick={handlePredict}
                                disabled={loading || isDetecting || isMonitoring}
                                className={`flex items-center px-6 py-2.5 rounded-lg font-medium transition-all ${loading || isDetecting || isMonitoring
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                            >
                                {isDetecting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Detecting...
                                    </>
                                ) : (
                                    <>
                                        <FiVideo className="mr-2" />
                                        Single Detection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Results Section */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4">Detection Results</h2>

                            {prediction ? (
                                <div className="space-y-6">
                                    <div className={`flex items-center p-4 rounded-lg ${prediction.detected ? "bg-red-500/20" : "bg-green-500/20"
                                        }`}>
                                        {prediction.detected ? (
                                            <FiAlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                                        ) : (
                                            <FiCheck className="w-6 h-6 text-green-500 mr-3" />
                                        )}
                                        <div>
                                            <h3 className={`font-medium ${prediction.detected ? "text-red-400" : "text-green-400"
                                                }`}>
                                                {prediction.className}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Confidence: {(prediction.confidence * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                                            Confidence Level
                                        </h3>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${prediction.detected ? "bg-red-500" : "bg-green-500"
                                                    }`}
                                                style={{ width: `${prediction.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                                    <FiVideo className="w-8 h-8 mb-2 opacity-50" />
                                    <p>No detection performed yet</p>
                                    <p className="text-sm mt-1 text-gray-500">
                                        Click the detect button to start
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Recommended Actions */}
                        {prediction?.detected && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <h2 className="text-xl font-semibold text-white mb-4">Recommended Actions</h2>
                                <div className="space-y-4">
                                    {getRecommendedActions().map((action, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50"
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.severity === 'high' ? 'bg-red-500/20' : 'bg-orange-500/20'
                                                    }`}>
                                                    {action.icon}
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-white font-medium">{action.title}</h3>
                                                    <p className="text-sm text-gray-400">{action.description}</p>
                                                </div>
                                            </div>
                                            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${action.severity === 'high'
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-orange-600 hover:bg-orange-700 text-white'
                                                }`}>
                                                {action.button}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detection History */}
                        {/* {detectionHistory.length > 0 && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <h2 className="text-xl font-semibold text-white mb-4">Recent Detections</h2>
                                <div className="space-y-3">
                                    {detectionHistory.map((detection, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 rounded-lg bg-red-500/10"
                                        >
                                            <div className="flex items-center">
                                                <FiAlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                                                <div>
                                                    <p className="text-red-400 font-medium">{detection.className}</p>
                                                    <p className="text-sm text-gray-400">
                                                        {new Date(detection.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                {(detection.confidence * 100).toFixed(2)}% confidence
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {prediction?.detected && (
                            <div className="text-sm text-gray-400 mt-2">
                                Category: {prediction.category?.toLowerCase().replace('_', ' ')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViolenceDetection;
