import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import Webcam from "react-webcam";

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [densityStatus, setDensityStatus] = useState("Low Density");
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [monitoringData, setMonitoringData] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [reportPeriod, setReportPeriod] = useState("hourly");
  const [reportType, setReportType] = useState("all");
  const [mounted, setMounted] = useState(false);

  const lowDensityThreshold = 1;
  const highDensityThreshold = 3;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Add data point to monitoring history
  const addDataPoint = (timestamp, count, status) => {
    setMonitoringData(prevData => [
      ...prevData,
      { timestamp, count, status }
    ]);
  };

  // Generate report based on criteria
  const generateReport = () => {
    // Filter by time period
    const now = new Date();
    let filteredData = [...monitoringData];

    if (reportPeriod === "hourly") {
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      filteredData = filteredData.filter(item => new Date(item.timestamp) >= hourAgo);
    } else if (reportPeriod === "daily") {
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(item => new Date(item.timestamp) >= dayAgo);
    } else if (reportPeriod === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(item => new Date(item.timestamp) >= weekAgo);
    }

    // Filter by density type
    if (reportType !== "all") {
      filteredData = filteredData.filter(item => {
        if (reportType === "low") return item.status === "Low Density";
        if (reportType === "medium") return item.status === "Medium Density";
        if (reportType === "high") return item.status === "High Density - ALERT!";
        return true;
      });
    }

    // Calculate statistics
    const totalSamples = filteredData.length;
    const averageCount = totalSamples > 0
      ? filteredData.reduce((sum, item) => sum + item.count, 0) / totalSamples
      : 0;

    const densityCounts = {
      "Low Density": 0,
      "Medium Density": 0,
      "High Density - ALERT!": 0
    };

    filteredData.forEach(item => {
      densityCounts[item.status]++;
    });

    const peakTime = totalSamples > 0
      ? filteredData.reduce((max, item) => item.count > max.count ? item : max, filteredData[0])
      : null;

    // Create report content
    let reportContent = `# Crowd Density Report\n\n`;
    reportContent += `Generated: ${now.toLocaleString()}\n`;
    reportContent += `Period: ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}\n`;
    reportContent += `Density Filter: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}\n\n`;

    reportContent += `## Summary Statistics\n`;
    reportContent += `Total Samples: ${totalSamples}\n`;
    reportContent += `Average Person Count: ${averageCount.toFixed(2)}\n\n`;

    reportContent += `## Density Distribution\n`;
    reportContent += `Low Density: ${densityCounts["Low Density"]} (${totalSamples > 0 ? ((densityCounts["Low Density"] / totalSamples) * 100).toFixed(1) : 0}%)\n`;
    reportContent += `Medium Density: ${densityCounts["Medium Density"]} (${totalSamples > 0 ? ((densityCounts["Medium Density"] / totalSamples) * 100).toFixed(1) : 0}%)\n`;
    reportContent += `High Density: ${densityCounts["High Density - ALERT!"]} (${totalSamples > 0 ? ((densityCounts["High Density - ALERT!"] / totalSamples) * 100).toFixed(1) : 0}%)\n\n`;

    if (peakTime) {
      reportContent += `## Peak Time\n`;
      reportContent += `Time: ${new Date(peakTime.timestamp).toLocaleString()}\n`;
      reportContent += `Count: ${peakTime.count}\n`;
      reportContent += `Status: ${peakTime.status}\n\n`;
    }

    reportContent += `## Raw Data\n`;
    reportContent += `Time,Count,Status\n`;
    filteredData.forEach(item => {
      reportContent += `${new Date(item.timestamp).toLocaleString()},${item.count},${item.status}\n`;
    });

    return reportContent;
  };

  // Download report as text file
  const downloadReport = () => {
    const reportContent = generateReport();
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crowd-report-${reportPeriod}-${reportType}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const runDetection = async () => {
      try {
        const model = await cocoSsd.load();
        console.log("Model loaded!");
        setIsModelLoaded(true);

        const detectObjects = () => {
          if (
            !isMonitoring ||
            !webcamRef.current ||
            !webcamRef.current.video ||
            webcamRef.current.video.readyState !== 4 ||
            !canvasRef.current
          ) {
            return;
          }

          const video = webcamRef.current.video;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;

          const context = canvasRef.current.getContext("2d");

          model.detect(video).then((predictions) => {
            context.clearRect(0, 0, videoWidth, videoHeight);
            context.drawImage(video, 0, 0, videoWidth, videoHeight);

            let personCount = 0;
            predictions.forEach((prediction) => {
              if (prediction.class === "person") {
                personCount++;
                const [x, y, width, height] = prediction.bbox;
                context.strokeStyle = "#00B4D8";
                context.lineWidth = 2;
                context.strokeRect(x, y, width, height);
                context.fillStyle = "#00B4D8";
                context.font = "14px Arial";
                context.fillText(
                  prediction.class,
                  x,
                  y > 10 ? y - 5 : y + 15
                );
              }
            });

            let status = "Low Density";
            if (personCount > lowDensityThreshold && personCount < highDensityThreshold) {
              status = "Medium Density";
            } else if (personCount >= highDensityThreshold) {
              status = "High Density - ALERT!";
            }
            setDensityStatus(status);

            const now = new Date();
            if (now.getSeconds() % 5 === 0 && now.getMilliseconds() < 200) {
              addDataPoint(now.toISOString(), personCount, status);
            }

            // Modern overlay styling
            context.font = "bold 16px Arial";
            context.fillStyle = "rgba(0, 0, 0, 0.7)";
            context.fillRect(10, 10, 200, 60);
            context.fillStyle = "#E2E8F0";
            context.fillText(`Count: ${personCount}`, 20, 35);
            context.fillText(`Status: ${status}`, 20, 60);
          });
        };

        const interval = setInterval(detectObjects, 100);
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };

    runDetection();
  }, [isMonitoring]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "High Density - ALERT!":
        return "text-rose-500";
      case "Medium Density":
        return "text-amber-500";
      default:
        return "text-emerald-500";
    }
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
              Stampede Monitoring System
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time crowd density analysis powered by AI
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl transform rotate-2 scale-105"></div>
                <div className="relative bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-xl">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700/50">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      width={640}
                      height={480}
                      videoConstraints={videoConstraints}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className={`text-center sm:text-left ${getStatusColor(densityStatus)}`}>
                      <h2 className="text-2xl font-bold mb-2">Current Status</h2>
                      <p className="text-lg">{densityStatus}</p>
                    </div>
                    <button
                      onClick={() => setIsMonitoring(prev => !prev)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${isMonitoring
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                    >
                      {isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring'}
                    </button>
                  </div>

                  {!isModelLoaded && (
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

            {/* Report Generator */}
            <div className="lg:col-span-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl transform rotate-2 scale-105"></div>
                <div className="relative bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6">Report Generator</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Time Period</label>
                      <select
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="hourly">Last Hour</option>
                        <option value="daily">Last 24 Hours</option>
                        <option value="weekly">Last Week</option>
                        <option value="all">All Data</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Density Type</label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="all">All Densities</option>
                        <option value="low">Low Density Only</option>
                        <option value="medium">Medium Density Only</option>
                        <option value="high">High Density Only</option>
                      </select>
                    </div>

                    <button
                      onClick={downloadReport}
                      disabled={monitoringData.length === 0}
                      className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white font-medium text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      Generate & Download Report
                    </button>

                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-2">Data Collection Status</h3>
                      <p className="text-gray-400">
                        Data Points: <span className="text-blue-400 font-medium">{monitoringData.length}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Sampling every 5 seconds during active monitoring
                      </p>
                    </div>
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

export default App;