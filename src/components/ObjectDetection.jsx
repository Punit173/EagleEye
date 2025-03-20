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

  const lowDensityThreshold = 10;
  const highDensityThreshold = 30;

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

          // Set canvas dimensions
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;

          const context = canvasRef.current.getContext("2d");

          // Perform detection
          model.detect(video).then((predictions) => {
            context.clearRect(0, 0, videoWidth, videoHeight);
            context.drawImage(video, 0, 0, videoWidth, videoHeight);

            let personCount = 0;
            predictions.forEach((prediction) => {
              if (prediction.class === "person") {
                personCount++;
                const [x, y, width, height] = prediction.bbox;
                context.strokeStyle = "green";
                context.lineWidth = 2;
                context.strokeRect(x, y, width, height);
                context.fillStyle = "green";
                context.fillText(
                  prediction.class,
                  x,
                  y > 10 ? y - 5 : y + 15
                );
              }
            });

            // Update density status
            let status = "Low Density";
            if (personCount >= lowDensityThreshold && personCount < highDensityThreshold) {
              status = "Medium Density";
            } else if (personCount >= highDensityThreshold) {
              status = "High Density - ALERT!";
            }
            setDensityStatus(status);

            // Add data point every 5 seconds (to prevent overwhelming data)
            const now = new Date();
            if (now.getSeconds() % 5 === 0 && now.getMilliseconds() < 200) {
              addDataPoint(now.toISOString(), personCount, status);
            }

            // Overlay text
            context.font = "16px Arial";
            context.fillStyle = "white";
            context.fillText(`Count: ${personCount}`, 10, 20);
            context.fillText(`Status: ${status}`, 10, 40);
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Crowd Monitoring System</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3">
          <div
            style={{
              position: "relative",
              width: "640px",
              height: "480px",
              margin: "0 auto",
              border: "1px solid #ccc"
            }}
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              width={640}
              height={480}
              videoConstraints={videoConstraints}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <h2 className="text-xl">Status: <span className={
              densityStatus.includes("High") ? "text-red-600 font-bold" :
                densityStatus.includes("Medium") ? "text-yellow-600 font-bold" :
                  "text-green-600 font-bold"
            }>{densityStatus}</span></h2>

            <button
              onClick={() => setIsMonitoring(prev => !prev)}
              className={`px-4 py-2 rounded ${isMonitoring ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring'}
            </button>
          </div>

          {!isModelLoaded && <p className="text-center mt-2">Loading model, please wait...</p>}
        </div>

        <div className="md:w-1/3 bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Report Generator</h2>

          <div className="mb-4">
            <label className="block mb-1">Time Period:</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="hourly">Last Hour</option>
              <option value="daily">Last 24 Hours</option>
              <option value="weekly">Last Week</option>
              <option value="all">All Data</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Density Type:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border rounded"
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Generate & Download Report
          </button>

          <div className="mt-4">
            <h3 className="font-semibold">Data Points Collected: {monitoringData.length}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Data is sampled every 5 seconds during active monitoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;