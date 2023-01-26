import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as FaceMesh from "@mediapipe/face_mesh";
import * as FaceDetection from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { drawRectangle, drawConnectors } from "@mediapipe/drawing_utils";

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvaFacesMeshRef = useRef<HTMLCanvasElement>(null);
  const canvasFaceDetectionRef = useRef<HTMLCanvasElement>(null);

  const faceMesh = new FaceMesh.FaceMesh({
    locateFile: (file, base) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    },
  });
  const faceDetection = new FaceDetection.FaceDetection({
    locateFile: (file, base) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
    },
  });

  useEffect(() => {
    faceMesh.setOptions({
      maxNumFaces: 10,
      selfieMode: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceDetection.setOptions({ model: "short", selfieMode: true, minDetectionConfidence: 0.5 });
    faceMesh.onResults(onResultsFaceMesh);
    faceDetection.onResults(onResultsFaceDetection);

    const currentWebcam = webcamRef.current as any;
    if (typeof currentWebcam !== "undefined" && currentWebcam !== null) {
      let camera;
      camera = new Camera(currentWebcam?.video, {
        onFrame: async () => {
          await faceMesh.send({ image: currentWebcam?.video });
          await faceDetection.send({ image: currentWebcam?.video });
        },
        width: currentWebcam.video.width,
        height: currentWebcam.video.height,
      });
      camera.start();
    }
  }, [webcamRef.current?.video?.readyState]);

  const onResultsFaceMesh = (results: FaceMesh.Results) => {
    if (results) {
      const currentWebcam = webcamRef.current as any;
      const canvasCurrent = canvaFacesMeshRef.current as HTMLCanvasElement;
      const videoWidth = currentWebcam.video.videoWidth;
      const videoHeight = currentWebcam.video.videoHeight;
      canvasCurrent.width = videoWidth;
      canvasCurrent.height = videoHeight;
      if (results.multiFaceLandmarks) {
        const ctx = canvasCurrent.getContext("2d") as CanvasRenderingContext2D;
        for (const landmarks of results.multiFaceLandmarks) {
          drawConnectors(ctx, landmarks, FaceMesh.FACEMESH_TESSELATION, { color: "teal", lineWidth: 1 });
        }
        ctx.restore();
      }
    }
  };

  const onResultsFaceDetection = (results: FaceDetection.Results) => {
    const currentWebcam = webcamRef.current as any;
    const canvasCurrent = canvasFaceDetectionRef.current as HTMLCanvasElement;
    const videoWidth = currentWebcam.video.videoWidth;
    const videoHeight = currentWebcam.video.videoHeight;
    canvasCurrent.width = videoWidth;
    canvasCurrent.height = videoHeight;
    if (canvasCurrent && results) {
      const ctx = canvasCurrent.getContext("2d") as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, canvasCurrent.width, canvasCurrent.height);
      ctx.drawImage(results.image, 0, 0, canvasCurrent.width, canvasCurrent.height);
      results.detections.map((x: FaceDetection.Detection) => {
        drawRectangle(ctx, x.boundingBox, { color: "red", lineWidth: 2, fillColor: "#00000000" });
      });
      ctx.restore();
    }
  };

  return (
    <div className="App">
      <div style={{ width: "100%", height: 480, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{
            position: "absolute",
            maxHeight: "100%",
            maxWidth: "100%",
            textAlign: "center",
            margin: "auto",
            left: 0,
            right: 0,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          videoConstraints={{
            facingMode: "user",
            height: 480,
            width: 480,
          }}
        />
        <canvas
          ref={canvasFaceDetectionRef}
          style={{
            position: "absolute",
            maxHeight: "100%",
            maxWidth: "100%",
            textAlign: "center",
            left: 0,
            right: 0,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <canvas
          ref={canvaFacesMeshRef}
          style={{
            position: "absolute",
            maxHeight: "100%",
            maxWidth: "100%",
            textAlign: "center",
            left: 0,
            right: 0,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    </div>
  );
}

export default App;
