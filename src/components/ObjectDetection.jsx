import React, { useRef, useState, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    let mounted = true;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to access camera. Please check permissions.");
          setLoading(false);
        }
        console.error("Camera access error:", err);
      }
    };

    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        if (mounted) {
          setModel(loadedModel);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load the AI model. Please try again.");
          setLoading(false);
        }
        console.error("Model loading error:", err);
      }
    };

    setupCamera();
    loadModel();

    return () => {
      mounted = false;
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const detect = async () => {
      if (!video || video.paused || video.ended) return;

      try {
        const predictions = await model.detect(video);
        setDetections(predictions);

        // Draw on canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        predictions.forEach((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          ctx.strokeStyle = prediction.class === "person" ? "#00B4D8" : "#FF3D00";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          // Add label
          ctx.fillStyle = prediction.class === "person" ? "#00B4D8" : "#FF3D00";
          ctx.font = "16px Arial";
          ctx.fillText(
            `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
            x,
            y - 5
          );
        });

        requestAnimationFrame(detect);
      } catch (err) {
        console.error("Detection error:", err);
        setError("Error during object detection. Please try again.");
      }
    };

    detect();
  }, [model]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center bg-[#1A1F2E] min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center text-[#00B4D8] mb-4">
        CCTV Analysis System
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
          <>
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
            ></canvas>
          </>
        )}
      </div>

      <div className="mt-6 w-full max-w-4xl">
        <div className="bg-[#2A3142] border border-[#3B4251] rounded-lg shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-white">Detections</h2>
            {detections.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {detections.map((det, index) => (
                  <li key={index} className="text-[#94A3B8]">
                    <span className="font-medium text-white">{det.class}</span> - 
                    Confidence: {(det.score * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#94A3B8] mt-2">No objects detected yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetection;