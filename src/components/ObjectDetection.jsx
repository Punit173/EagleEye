import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocossd from '@tensorflow-models/coco-ssd';

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState([]);
  const [isTheftDetected, setIsTheftDetected] = useState(false);
  const [lastPositions, setLastPositions] = useState({});

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setLoading(false);
        console.log('Model loaded successfully');
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };
    loadModel();
    return () => {};
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Browser API navigator.mediaDevices.getUserMedia not available');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    };

    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId;

    const detectObjects = async () => {
      if (model && videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        if (canvasRef.current) {
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
        }

        const predictions = await model.detect(video);
        setDetections(predictions);
        analyzeForTheft(predictions);

        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          drawPredictions(predictions, ctx);
        }
      }

      animationFrameId = requestAnimationFrame(detectObjects);
    };

    if (!loading) {
      detectObjects();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [model, loading]);

  const analyzeForTheft = (predictions) => {
    const personObjects = predictions.filter((pred) => pred.class === 'person');
    const valuableObjects = predictions.filter((pred) =>
      ['cell phone', 'laptop', 'backpack', 'handbag', 'suitcase', 'wallet'].includes(pred.class)
    );

    const newPositions = { ...lastPositions };

    valuableObjects.forEach((obj) => {
      const objId = `${obj.class}_${obj.bbox[0].toFixed(0)}_${obj.bbox[1].toFixed(0)}`;

      if (newPositions[objId]) {
        const prevPos = newPositions[objId];
        const currentPos = { x: obj.bbox[0], y: obj.bbox[1] };

        const distance = Math.sqrt(
          Math.pow(currentPos.x - prevPos.x, 2) +
            Math.pow(currentPos.y - prevPos.y, 2)
        );

        if (distance > 30) {
          const isPersonNearby = personObjects.some((person) => {
            const personCenter = {
              x: person.bbox[0] + person.bbox[2] / 2,
              y: person.bbox[1] + person.bbox[3] / 2,
            };

            const objCenter = {
              x: obj.bbox[0] + obj.bbox[2] / 2,
              y: obj.bbox[1] + obj.bbox[3] / 2,
            };

            const distanceToPerson = Math.sqrt(
              Math.pow(personCenter.x - objCenter.x, 2) +
                Math.pow(personCenter.y - objCenter.y, 2)
            );

            return distanceToPerson < 150;
          });

          if (isPersonNearby) {
            setIsTheftDetected(true);
            setTimeout(() => setIsTheftDetected(false), 5000);
          }
        }
      }

      newPositions[objId] = { x: obj.bbox[0], y: obj.bbox[1] };
    });

    setLastPositions(newPositions);
  };

  const drawPredictions = (predictions, ctx) => {
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      const text = `${prediction.class} ${Math.round(prediction.score * 100)}%`;

      ctx.strokeStyle = isTheftDetected ? 'red' : '#00FFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = isTheftDetected ? 'red' : '#00FFFF';
      ctx.fillRect(x, y - 20, text.length * 7, 20);

      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText(text, x, y - 5);
    });

    if (isTheftDetected) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(0, 0, ctx.canvas.width, 40);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('⚠️ POTENTIAL THEFT DETECTED!', 20, 30);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Theft Detection System</h2>
      {loading ? (
        <div className="text-lg text-blue-600">Loading model...</div>
      ) : (
        <div className="relative w-full max-w-3xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="rounded-lg shadow-lg w-full"
          />
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full rounded-lg border-4 ${
              isTheftDetected ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {isTheftDetected && (
            <div className="absolute top-0 left-0 w-full p-2 bg-red-500 text-white text-center font-semibold">
              ⚠️ Potential theft detected!
            </div>
          )}
          <div className="mt-4 p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Detected Objects:</h3>
            <ul className="list-disc pl-5">
              {detections.map((detection, index) => (
                <li key={index} className="text-gray-700">
                  {detection.class} - Confidence: {Math.round(detection.score * 100)}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
