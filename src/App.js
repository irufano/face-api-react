import { useRef } from "react";
import * as faceapi from "face-api.js";

const inputResolution = {
  width: 1080,
  height: 900,
};

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const displaySize = {
    width: inputResolution.width,
    height: inputResolution.height,
  };

  // open webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: (inputResolution.width, inputResolution.height),
        audio: false,
      })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        detect();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // load models
  const loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + "/models";
    console.log("load models");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      // faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      // faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      // faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      // faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      // faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
      // detect();
      startVideo();
      console.log("models loaded");
    });
  };

  const detect = () => {
    setInterval(async () => {
      const ctx = canvasRef.current.getContext("2d");
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          minConfidence: 0.6,
          maxResults: 10,
        })
      );

      ctx.clearRect(0, 0, inputResolution.width, inputResolution.height);

      // draw canvas
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
        videoRef.current
      );

      faceapi.matchDimensions(canvasRef.current, displaySize);

      const resized = faceapi.resizeResults(detections, displaySize);
      
      requestAnimationFrame(() =>
        faceapi.draw.drawDetections(canvasRef.current, resized)
      );
    }, 100);
  };

  const onPlayVideo = () => {
    detect();
  };

  loadModels();
  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        width={inputResolution.width}
        height={inputResolution.height}
        onPlay={onPlayVideo}
        style={{
          position: "absolute",
        }}
      ></video>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
        }}
      ></canvas>
    </div>
  );
}

export default App;
