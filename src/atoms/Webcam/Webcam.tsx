import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createCanvasFromMedia,
  detectAllFaces,
  draw,
  matchDimensions,
  nets,
  resizeResults,
  TinyFaceDetectorOptions,
} from 'face-api.js';
import { StyledWebcamContainer } from './Webcam.styles';

interface WebcamProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  width: number;
  height: number;
}

export const Webcam = ({ width, height, ...rest }: WebcamProps) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([
      nets.tinyFaceDetector.loadFromUri('/models'),
      nets.faceLandmark68Net.loadFromUri('/models'),
      nets.faceRecognitionNet.loadFromUri('/models'),
      nets.faceExpressionNet.loadFromUri('/models'),
    ])
      .catch((error) => {
        console.error('Error loading models:', error);
      })
      .then(() => {
        return navigator.mediaDevices.getUserMedia({ video: true });
      })
      .then((stream) => {
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          setIsReady(true);
        }
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });
  }, []);

  const handlePlay = useCallback(() => {
    if (!isReady || !webcamRef.current) return;

    const canvasObject = createCanvasFromMedia(webcamRef.current, { width, height });
    containerRef.current?.appendChild(canvasObject);

    const displaySize = { width: webcamRef.current.width, height: webcamRef.current.height };

    matchDimensions(canvasObject, displaySize);

    setInterval(async () => {
      if (webcamRef.current) {
        const detections = await detectAllFaces(webcamRef.current, new TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        canvasObject.getContext('2d')?.clearRect(0, 0, width, height);
        draw.drawDetections(canvasObject, resizeResults(detections, { width, height }));
      }
    }, 100);
  }, [isReady]);

  return (
    <StyledWebcamContainer ref={containerRef}>
      <video
        width={width}
        height={height}
        ref={webcamRef}
        autoPlay
        muted
        onPlay={handlePlay}
        {...rest}
      ></video>
    </StyledWebcamContainer>
  );
};
