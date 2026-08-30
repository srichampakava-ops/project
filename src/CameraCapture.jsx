import { useRef, useState, useEffect } from 'react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let frameCheckTimeout;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        frameCheckTimeout = setTimeout(() => {
          const video = videoRef.current;
          if (video && video.readyState < 2) {
            setFallback(true);
            stream.getTracks().forEach((track) => track.stop());
          }
        }, 1500);
      } catch (err) {
        setError(err.message);
        setFallback(true);
      }
    }

    startCamera();

    return () => {
      clearTimeout(frameCheckTimeout);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (fallback) {
      onClose(true); // true = "open the gallery/file picker instead"
    }
  }, [fallback]);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        streamRef.current.getTracks().forEach((track) => track.stop());
        onCapture(file);
      },
      'image/jpeg',
      0.9
    );
  }

  if (fallback) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'black',
        zIndex: 1000
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover'
        }}
      />
      {error && (
        <div style={{ position: 'fixed', top: 20, left: 20, color: 'red', zIndex: 1001 }}>
          {error}
        </div>
      )}
      <div
        style={{
          position: 'fixed',
          bottom: 30,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          zIndex: 1001
        }}
      >
        <button onClick={handleCapture} className="scan-btn scan-btn-primary">
          📸 Capture
        </button>
        <button onClick={() => onClose(false)} className="scan-btn scan-btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}