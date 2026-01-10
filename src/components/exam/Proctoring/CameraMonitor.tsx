// Camera Monitor Component for Exam Proctoring
// Displays webcam preview and handles snapshot capture

import { useEffect, useCallback, useState } from 'react';
import { Video, VideoOff, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebcam } from '@/hooks/useWebcam';

interface CameraMonitorProps {
    onSnapshot?: (imageData: string) => void;
    snapshotInterval?: number; // in milliseconds
    showPreview?: boolean;
    enabled?: boolean;
}

export function CameraMonitor({
    onSnapshot,
    snapshotInterval = 30000, // 30 seconds default
    showPreview = true,
    enabled = true,
}: CameraMonitorProps) {
    const {
        isActive,
        isSupported,
        error,
        videoRef,
        start,
        stop,
        captureSnapshot
    } = useWebcam({ width: 320, height: 240 });

    const [snapshotCount, setSnapshotCount] = useState(0);
    const [lastSnapshotTime, setLastSnapshotTime] = useState<Date | null>(null);

    // Auto-start camera when enabled
    useEffect(() => {
        if (enabled && isSupported && !isActive) {
            start();
        }
        return () => {
            if (isActive) {
                stop();
            }
        };
    }, [enabled, isSupported, isActive, start, stop]);

    // Periodic snapshot capture
    const takeSnapshot = useCallback(() => {
        if (!isActive) return;

        const snapshot = captureSnapshot();
        if (snapshot && onSnapshot) {
            onSnapshot(snapshot);
            setSnapshotCount(prev => prev + 1);
            setLastSnapshotTime(new Date());
        }
    }, [isActive, captureSnapshot, onSnapshot]);

    // Auto snapshot interval
    useEffect(() => {
        if (!enabled || !isActive || !snapshotInterval) return;

        // Take initial snapshot
        const initialTimeout = setTimeout(takeSnapshot, 5000);

        // Then periodic snapshots
        const interval = setInterval(takeSnapshot, snapshotInterval);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [enabled, isActive, snapshotInterval, takeSnapshot]);

    if (!isSupported) {
        return (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Camera không được hỗ trợ trên trình duyệt này</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                    <VideoOff className="w-4 h-4" />
                    <span>Lỗi camera: {error}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={start}
                    className="mt-2"
                >
                    Thử lại
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Camera Preview */}
            {showPreview && (
                <div className="relative aspect-video bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Recording indicator */}
                    {isActive && (
                        <div className="absolute top-2 left-2 flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                                REC
                            </span>
                        </div>
                    )}

                    {/* Snapshot counter */}
                    <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/50 text-white">
                            <Camera className="w-3 h-3 mr-1" />
                            {snapshotCount}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Status bar */}
            <div className="p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    {isActive ? (
                        <>
                            <Video className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">Camera đang hoạt động</span>
                        </>
                    ) : (
                        <>
                            <VideoOff className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Camera tắt</span>
                        </>
                    )}
                </div>

                {lastSnapshotTime && (
                    <span className="text-xs text-muted-foreground">
                        Snapshot: {lastSnapshotTime.toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
}

export default CameraMonitor;
