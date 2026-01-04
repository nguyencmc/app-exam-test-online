import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
    src: string;
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
}

export const VideoPlayer = ({ src, onProgress, onComplete }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const currentProgress = (video.currentTime / video.duration) * 100;
            setProgress(currentProgress);
            onProgress?.(currentProgress);

            if (currentProgress >= 90 && !video.ended) {
                onComplete?.();
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [onProgress, onComplete]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const changePlaybackRate = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const bounds = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - bounds.left) / bounds.width;
            videoRef.current.currentTime = percent * videoRef.current.duration;
        }
    };

    return (
        <div className="relative bg-black rounded-lg overflow-hidden group">
            <video
                ref={videoRef}
                src={src}
                className="w-full aspect-video"
                onClick={togglePlay}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Progress Bar */}
                <div
                    className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={toggleMute}
                        >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>

                        <span className="text-sm">
                            {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/20"
                                >
                                    <Settings className="h-4 w-4 mr-1" />
                                    {playbackRate}x
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                    <DropdownMenuItem
                                        key={rate}
                                        onClick={() => changePlaybackRate(rate)}
                                    >
                                        {rate}x
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={toggleFullscreen}
                        >
                            <Maximize className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
