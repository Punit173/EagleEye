import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as mpPose from "@mediapipe/pose";
import * as mpFaceMesh from "@mediapipe/face_mesh";

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPeople: 0,
    staffCount: 0,
    customerCount: 0,
    suspiciousActions: 0,
    itemsPicked: 0
  });
  const [trackedPeople, setTrackedPeople] = useState(new Map());
  const [detectedItems, setDetectedItems] = useState(new Set());

  useEffect(() => {
    let mounted = true;

    const setupCamera = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720
          },
        });

        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          await loadModels();
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to access camera. Please check permissions.");
          setLoading(false);
        }
        console.error("Camera access error:", err);
      }
    };

    setupCamera();

    return () => {
      mounted = false;
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const loadModels = async () => {
    try {
      // Load COCO-SSD for object detection
      const objectDetectionModel = await cocoSsd.load();

      // Load MediaPipe Pose for pose detection
      const pose = new mpPose.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      // Load MediaPipe Face Mesh for face recognition
      const faceMesh = new mpFaceMesh.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 10,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Start detection loops
      startDetection(objectDetectionModel, pose, faceMesh);
      setLoading(false);
    } catch (err) {
      console.error("Error loading models:", err);
      setError("Failed to load AI models. Please refresh the page.");
      setLoading(false);
    }
  };

  const startDetection = (objectModel, pose, faceMesh) => {
    const detect = async () => {
      if (!videoRef.current) return;

      // Run object detection
      const objects = await objectModel.detect(videoRef.current);

      // Run pose detection
      await pose.send({ image: videoRef.current });

      // Run face detection
      await faceMesh.send({ image: videoRef.current });

      // Process detections
      processDetections(objects);

      // Draw results
      drawResults(objects);

      requestAnimationFrame(detect);
    };

    detect();
  };

  const processDetections = (objects) => {
    const currentPeople = new Set();
    const currentItems = new Set();

    objects.forEach(detection => {
      if (detection.class === "person") {
        const personId = generatePersonId(detection.bbox);
        currentPeople.add(personId);

        if (!trackedPeople.has(personId)) {
          // New person detected
          const isStaff = classifyPerson(detection);
          trackedPeople.set(personId, {
            type: isStaff ? "staff" : "customer",
            bbox: detection.bbox,
            items: new Set()
          });

          setStats(prev => ({
            ...prev,
            totalPeople: prev.totalPeople + 1,
            [isStaff ? "staffCount" : "customerCount"]: prev[isStaff ? "staffCount" : "customerCount"] + 1
          }));
        }
      } else if (detection.class === "handbag" || detection.class === "backpack" ||
        detection.class === "bottle" || detection.class === "cup") {
        currentItems.add(detection.class);
      }
    });

    // Check for suspicious actions
    checkSuspiciousActions(currentPeople, currentItems);
  };

  const classifyPerson = (detection) => {
    // Simple classification based on clothing color and position
    // In a real system, you would use more sophisticated methods
    const [x, y, width, height] = detection.bbox;
    const centerY = y + height / 2;

    // If person is in staff area (top half of frame)
    return centerY < canvasRef.current.height * 0.5;
  };

  const checkSuspiciousActions = (currentPeople, currentItems) => {
    trackedPeople.forEach((person, id) => {
      if (person.type === "customer") {
        // Check if customer is near items
        const isNearItems = Array.from(currentItems).some(item =>
          isNearby(person.bbox, item.bbox)
        );

        if (isNearItems) {
          // Check for pocketing action
          const isPocketing = detectPocketingAction(person);
          if (isPocketing) {
            setStats(prev => ({
              ...prev,
              suspiciousActions: prev.suspiciousActions + 1
            }));
          }
        }
      }
    });
  };

  const detectPocketingAction = (person) => {
    // Implement pocketing detection logic
    // This would use pose landmarks to detect hand movements
    return false; // Placeholder
  };

  const isNearby = (bbox1, bbox2) => {
    const [x1, y1, w1, h1] = bbox1;
    const [x2, y2, w2, h2] = bbox2;

    const center1 = { x: x1 + w1 / 2, y: y1 + h1 / 2 };
    const center2 = { x: x2 + w2 / 2, y: y2 + h2 / 2 };

    const distance = Math.sqrt(
      Math.pow(center1.x - center2.x, 2) +
      Math.pow(center1.y - center2.y, 2)
    );

    return distance < 100; // Threshold for "nearby"
  };

  const generatePersonId = (bbox) => {
    const [x, y, w, h] = bbox;
    return `${Math.round(x)},${Math.round(y)}`;
  };

  const drawResults = (objects) => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    // Set canvas dimensions
    if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }

    // Clear and draw video
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw detection boxes and labels
    objects.forEach(detection => {
      const [x, y, width, height] = detection.bbox;

      // Draw box
      ctx.strokeStyle = detection.class === "person" ? "#00ff00" : "#ff0000";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label
      ctx.fillStyle = detection.class === "person" ? "#00ff00" : "#ff0000";
      ctx.font = "16px Arial";
      ctx.fillText(`${detection.class} (${Math.round(detection.score * 100)}%)`, x, y - 5);
    });

    // Draw statistics
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 300, 150);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`Total People: ${stats.totalPeople}`, 20, 40);
    ctx.fillText(`Staff: ${stats.staffCount}`, 20, 70);
    ctx.fillText(`Customers: ${stats.customerCount}`, 20, 100);
    ctx.fillText(`Suspicious Actions: ${stats.suspiciousActions}`, 20, 130);
  };

  return (
    <div className="flex flex-col items-center bg-[#1A1F2E] min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center text-[#00B4D8] mb-4">
        Smart Surveillance System
      </h1>

      {error && (
        <div className="w-full max-w-4xl mb-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <div className="relative w-full max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B4D8]"></div>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="hidden"
              autoPlay
              playsInline
              muted
            ></video>
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg shadow-lg"
              style={{ border: "4px solid #00B4D8" }}
            ></canvas>
          </div>
        )}
      </div>

      <div className="mt-6 w-full max-w-4xl">
        <div className="bg-[#2A3142] border border-[#3B4251] rounded-lg shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-white">Real-time Statistics</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-[#1A1F2E] p-4 rounded-lg">
                <h3 className="text-[#94A3B8] text-sm">Total People</h3>
                <p className="text-3xl font-bold text-[#00B4D8]">{stats.totalPeople}</p>
              </div>
              <div className="bg-[#1A1F2E] p-4 rounded-lg">
                <h3 className="text-[#94A3B8] text-sm">Staff Members</h3>
                <p className="text-3xl font-bold text-[#00B4D8]">{stats.staffCount}</p>
              </div>
              <div className="bg-[#1A1F2E] p-4 rounded-lg">
                <h3 className="text-[#94A3B8] text-sm">Customers</h3>
                <p className="text-3xl font-bold text-[#00B4D8]">{stats.customerCount}</p>
              </div>
              <div className="bg-[#1A1F2E] p-4 rounded-lg">
                <h3 className="text-[#94A3B8] text-sm">Suspicious Actions</h3>
                <p className="text-3xl font-bold text-[#00B4D8]">{stats.suspiciousActions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetection;