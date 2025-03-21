import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { MdOutlineWarningAmber, MdDownload, MdEmail } from "react-icons/md";

const SuspiciousActivityDetector = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);
    const [detections, setDetections] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [emailSettings, setEmailSettings] = useState({
        recipient: "",
        frequency: "immediate", // immediate, hourly, daily
        showEmailForm: false
    });
    const lastPositionsRef = useRef({});
    const frameCounterRef = useRef(0);
    const prevTimeRef = useRef(performance.now());

    useEffect(() => {
        const setupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        const loadModel = async () => {
            const model = await cocoSsd.load();
            startDetection(model);
        };

        setupCamera();
        loadModel();

        return () => {
            // Cleanup
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Log suspicious activities with timestamps
    useEffect(() => {
        const suspiciousActivities = detections.filter(d => d.color === "red");
        if (suspiciousActivities.length > 0) {
            const timestamp = new Date().toISOString();
            const newLogs = suspiciousActivities.map(activity => ({
                id: activity.id,
                activity: activity.activity,
                timestamp,
                speed: activity.speed
            }));

            setActivityLog(prevLog => [...prevLog, ...newLogs]);

            // Send email for immediate notifications if configured
            if (emailSettings.recipient && emailSettings.frequency === "immediate") {
                sendEmailNotification(suspiciousActivities);
            }
        }
    }, [detections]);

    const startDetection = (model) => {
        const detectObjects = async () => {
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");

                // Make sure video is playing and has dimensions
                if (video.readyState === 4) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // Update FPS counter
                    frameCounterRef.current++;
                    const currentTime = performance.now();
                    if (currentTime - prevTimeRef.current >= 1000) {
                        setFps(frameCounterRef.current);
                        frameCounterRef.current = 0;
                        prevTimeRef.current = currentTime;
                    }

                    // Clear canvas and draw video frame
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    try {
                        const predictions = await model.detect(video);
                        const currentDetections = [];
                        const lastPositions = lastPositionsRef.current;
                        const updatedPositions = {};

                        predictions.forEach((prediction) => {
                            if (prediction.class === "person" && prediction.score > 0.6) {
                                const [x, y, width, height] = prediction.bbox;
                                const centerX = x + width / 2;
                                const centerY = y + height / 2;

                                // Create a unique ID based on position
                                // Using a more robust method that's less likely to create false new IDs
                                let closestId = null;
                                let closestDistance = Infinity;

                                // Find the closest previous detection
                                Object.keys(lastPositions).forEach(id => {
                                    const pos = lastPositions[id];
                                    const distance = Math.sqrt(
                                        Math.pow(centerX - pos.x, 2) +
                                        Math.pow(centerY - pos.y, 2)
                                    );
                                    if (distance < closestDistance && distance < 100) {
                                        closestDistance = distance;
                                        closestId = id;
                                    }
                                });

                                // Use existing ID or create new one
                                const id = closestId || `person-${Date.now()}-${Math.round(Math.random() * 1000)}`;
                                let activityType = "Standing";
                                let color = "green";

                                // Analyze movement
                                if (lastPositions[id]) {
                                    const deltaX = centerX - lastPositions[id].x;
                                    const deltaY = centerY - lastPositions[id].y;
                                    const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                                    // Store velocity for trend analysis
                                    const velocityHistory = lastPositions[id].velocityHistory || [];
                                    velocityHistory.push(speed);
                                    if (velocityHistory.length > 5) velocityHistory.shift();

                                    // Calculate average recent speed
                                    const avgSpeed = velocityHistory.reduce((sum, v) => sum + v, 0) / velocityHistory.length;

                                    // Detect activities based on movement patterns
                                    if (Math.abs(deltaY) > 40) {
                                        activityType = "Jumping";
                                        color = "red";
                                    } else if (avgSpeed > 80) {
                                        activityType = "Running";
                                        color = "red";
                                    } else if (avgSpeed > 40) {
                                        activityType = "Walking";
                                        color = "yellow";
                                    } else if (Math.abs(deltaX) > 70 && Math.abs(deltaY) < 20) {
                                        activityType = "Quick Exit";
                                        color = "red";
                                    }

                                    // Store detection with activity
                                    currentDetections.push({
                                        id,
                                        bbox: prediction.bbox,
                                        activity: activityType,
                                        color,
                                        speed: avgSpeed.toFixed(1)
                                    });

                                    // Update position with velocity history
                                    updatedPositions[id] = {
                                        x: centerX,
                                        y: centerY,
                                        lastSeen: Date.now(),
                                        velocityHistory
                                    };
                                } else {
                                    // First detection of this person
                                    currentDetections.push({
                                        id,
                                        bbox: prediction.bbox,
                                        activity: "New Person",
                                        color: "blue",
                                        speed: "0.0"
                                    });

                                    // Initialize position tracking
                                    updatedPositions[id] = {
                                        x: centerX,
                                        y: centerY,
                                        lastSeen: Date.now(),
                                        velocityHistory: [0]
                                    };
                                }
                            }
                        });

                        // Clean up old detections
                        const now = Date.now();
                        Object.keys(lastPositions).forEach(id => {
                            if (updatedPositions[id] || now - lastPositions[id].lastSeen > 1000) {
                                // Keep updated positions or remove if not seen for 1 second
                            } else {
                                updatedPositions[id] = {
                                    ...lastPositions[id],
                                    lastSeen: lastPositions[id].lastSeen
                                };
                            }
                        });

                        // Update state
                        lastPositionsRef.current = updatedPositions;
                        setDetections(currentDetections);

                        // Draw all detections on canvas
                        currentDetections.forEach(detection => {
                            const [x, y, width, height] = detection.bbox;

                            // Draw bounding box
                            context.strokeStyle = detection.color;
                            context.lineWidth = 3;
                            context.strokeRect(x, y, width, height);

                            // Draw activity label
                            context.fillStyle = "rgba(0, 0, 0, 0.7)";
                            const labelHeight = 24;
                            context.fillRect(x, y - labelHeight, width, labelHeight);

                            context.font = "16px Arial";
                            context.fillStyle = detection.color;
                            context.fillText(
                                `${detection.activity} (${detection.speed})`,
                                x + 5,
                                y - 7
                            );
                        });
                    } catch (error) {
                        console.error("Detection error:", error);
                    }
                }
            }
            requestAnimationFrame(detectObjects);
        };

        detectObjects();
    };

    // Generate downloadable report
    const generateReport = () => {
        const reportDate = new Date().toLocaleString();
        const reportTitle = `Suspicious Activity Report - ${reportDate}`;

        let reportContent = `# ${reportTitle}\n\n`;
        reportContent += `## Summary\n`;
        reportContent += `- Total events logged: ${activityLog.length}\n`;
        reportContent += `- Report generated: ${reportDate}\n\n`;

        reportContent += `## Activity Log\n\n`;
        reportContent += `| Timestamp | Activity | Person ID | Speed |\n`;
        reportContent += `|-----------|----------|-----------|-------|\n`;

        activityLog.forEach(log => {
            const formattedTime = new Date(log.timestamp).toLocaleString();
            reportContent += `| ${formattedTime} | ${log.activity} | ${log.id.substring(0, 8)}... | ${log.speed} |\n`;
        });

        // Create and download the report file
        const blob = new Blob([reportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Send email notification (mock implementation)
    const sendEmailNotification = (activities) => {
        // In a real implementation, you would connect to your backend or email service
        console.log(`Sending email notification to ${emailSettings.recipient}`);
        console.log("Suspicious activities detected:", activities);

        // For demonstration purposes:
        // alert(`Email notification sent to ${emailSettings.recipient} about suspicious activities!`);

        // In a real implementation, you might use:
        // fetch('/api/send-email', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ recipient: emailSettings.recipient, activities })
        // });
    };

    // Toggle email settings form
    const toggleEmailForm = () => {
        setEmailSettings(prev => ({
            ...prev,
            showEmailForm: !prev.showEmailForm
        }));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Suspicious Activity Detection</h1>
            <div className="relative">
                <video ref={videoRef} className="hidden"></video>
                <canvas ref={canvasRef} className="rounded-lg shadow-lg"></canvas>
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
                    FPS: {fps}
                </div>

                {/* Display summary of suspicious activities */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg max-w-xs">
                    <div className="flex items-center mb-1">
                        <MdOutlineWarningAmber size={20} className="text-yellow-500 mr-2" />
                        <span className="font-bold">Activity Summary</span>
                    </div>
                    {detections.filter(d => d.activity !== "Standing").map((d, idx) => (
                        <div key={idx} className={`text-${d.color}-500 text-sm`}>
                            • {d.activity} detected
                        </div>
                    ))}
                    {detections.filter(d => d.activity !== "Standing").length === 0 && (
                        <div className="text-green-500 text-sm">• No suspicious activity</div>
                    )}
                </div>
            </div>

            {/* Report and Email Controls */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
                <button
                    onClick={generateReport}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                    <MdDownload size={20} />
                    Download Activity Report ({activityLog.length} events)
                </button>

                <button
                    onClick={toggleEmailForm}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                    <MdEmail size={20} />
                    {emailSettings.showEmailForm ? "Hide Email Settings" : "Configure Email Alerts"}
                </button>
            </div>

            {/* Email Configuration Form */}
            {emailSettings.showEmailForm && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg w-full max-w-md">
                    <h3 className="text-xl font-semibold mb-3">Email Alert Settings</h3>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            value={emailSettings.recipient}
                            onChange={(e) => setEmailSettings(prev => ({ ...prev, recipient: e.target.value }))}
                            placeholder="your@email.com"
                            className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Alert Frequency</label>
                        <select
                            value={emailSettings.frequency}
                            onChange={(e) => setEmailSettings(prev => ({ ...prev, frequency: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                        >
                            <option value="immediate">Immediate (on suspicious activity)</option>
                            <option value="hourly">Hourly Summary</option>
                            <option value="daily">Daily Summary</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            alert(`Email alerts configured for ${emailSettings.recipient}`);
                            setEmailSettings(prev => ({ ...prev, showEmailForm: false }));
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                        Save Email Settings
                    </button>
                </div>
            )}

            {/* Activity Log Panel */}
            {activityLog.length > 0 && (
                <div className="mt-6 w-full max-w-3xl bg-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2 flex items-center">
                        <MdOutlineWarningAmber size={20} className="text-yellow-500 mr-2" />
                        Activity Log ({activityLog.length} events)
                    </h2>
                    <div className="overflow-auto max-h-60">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-2">Time</th>
                                    <th className="text-left p-2">Activity</th>
                                    <th className="text-left p-2">Person ID</th>
                                    <th className="text-left p-2">Speed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityLog.slice().reverse().map((log, idx) => (
                                    <tr key={idx} className="border-b border-gray-700">
                                        <td className="p-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td className="p-2 text-red-500 font-medium">{log.activity}</td>
                                        <td className="p-2">{log.id.substring(0, 8)}...</td>
                                        <td className="p-2">{log.speed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuspiciousActivityDetector;