// Webcam Hook for Exam Proctoring
// Handles camera access and snapshot capture

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseWebcamOptions {
    width?: number;
    height?: number;
    facingMode?: 'user' | 'environment';
}

export interface UseWebcamReturn {
    stream: MediaStream | null;
    isActive: boolean;
    isSupported: boolean;
    error: string | null;
    videoRef: React.RefObject<HTMLVideoElement>;
    start: () => Promise<boolean>;
    stop: () => void;
    captureSnapshot: () => string | null;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
    const { width = 640, height = 480, facingMode = 'user' } = options;

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Check if webcam is supported
    const isSupported = typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices &&
        !!navigator.mediaDevices.getUserMedia;

    // Start webcam
    const start = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            setError('Camera not supported in this browser');
            return false;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: width },
                    height: { ideal: height },
                    facingMode,
                },
                audio: false,
            });

            setStream(mediaStream);
            setIsActive(true);
            setError(null);

            // Attach to video element
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Camera access denied';
            setError(errorMessage);
            setIsActive(false);
            return false;
        }
    }, [isSupported, width, height, facingMode]);

    // Stop webcam
    const stop = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsActive(false);

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    // Capture snapshot
    const captureSnapshot = useCallback((): string | null => {
        if (!videoRef.current || !isActive) return null;

        // Create canvas if not exists
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth || width;
        canvas.height = video.videoHeight || height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Return as base64 JPEG (more compressed than PNG)
        return canvas.toDataURL('image/jpeg', 0.7);
    }, [isActive, width, height]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return {
        stream,
        isActive,
        isSupported,
        error,
        videoRef,
        start,
        stop,
        captureSnapshot,
    };
}
