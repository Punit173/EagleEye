import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

const ViolenceDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  // Load the COCO-SSD pre-trained model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setLoading(false);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };
    loadModel();
  }, []);

  // Run detection
  const runDetection = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      model
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video and canvas dimensions
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const ctx = canvasRef.current.getContext("2d");

      // Run prediction on video frames
      const predictions = await model.detect(video);

      // Clear canvas
      ctx.clearRect(0, 0, videoWidth, videoHeight);

      // Draw predictions
      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;
        const { class: detectedClass, score } = prediction;

        // Highlight potentially violent behavior (customized logic)
        if (detectedClass === "person" && score > 0.6) {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, width, height);
          ctx.font = "18px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(
            `${detectedClass} (${(score * 100).toFixed(1)}%)`,
            x,
            y - 10
          );

          // Trigger an alert based on detection logic
          setAlertMessage("Potential violent behavior detected!");
        } else {
          setAlertMessage("");
        }
      });

      // Call the function again
      requestAnimationFrame(runDetection);
    }
  };

  useEffect(() => {
    if (model) {
      runDetection();
    }
  }, [model]);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Violence Detection with Pre-trained Model
      </h1>
      <div className="relative">
        <Webcam
          ref={webcamRef}
          className="rounded-lg shadow-lg"
          style={{
            width: "640px",
            height: "480px",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-lg shadow-lg"
        />
      </div>
      {loading ? (
        <p className="text-lg text-gray-500 mt-4">Loading model...</p>
      ) : (
        <p className="text-lg text-green-500 mt-4">Model loaded successfully!</p>
      )}
      {alertMessage && (
        <p className="text-lg text-red-500 font-bold mt-4">{alertMessage}</p>
      )}
    </div>
  );
};

export default ViolenceDetection;
