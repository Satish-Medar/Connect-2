import { useState, useRef } from "react";

interface CameraState {
  isOpen: boolean;
  capturedImage: string | null;
  error: string | null;
  loading: boolean;
}

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    isOpen: false,
    capturedImage: null,
    error: null,
    loading: false,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setState(prev => ({
        ...prev,
        isOpen: true,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to access camera. Please check permissions.",
        loading: false,
      }));
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    context.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setState(prev => ({
      ...prev,
      capturedImage: imageData,
      isOpen: false,
    }));
    
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const selectFromGallery = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setState(prev => ({ ...prev, capturedImage: result }));
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      };
      
      input.click();
    });
  };

  const reset = () => {
    setState({
      isOpen: false,
      capturedImage: null,
      error: null,
      loading: false,
    });
  };

  return {
    ...state,
    videoRef,
    openCamera,
    capturePhoto,
    closeCamera,
    selectFromGallery,
    reset,
  };
}
