import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SyncedTranscript } from "@/components/podcast/SyncedTranscript";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    ArrowLeft,
    Headphones,
    Clock,
    User,
    Repeat,
    Download,
    Share2,
    Heart,
    FileText,
    ChevronDown,
    ChevronUp,
    Gauge,
    BookOpen,
    ListOrdered
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Podcast {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category_id: string | null;
    thumbnail_url: string | null;
    audio_url: string | null;
    duration_seconds: number | null;
    episode_number: number | null;
    host_name: string | null;
    listen_count: number | null;
    is_featured: boolean | null;
    difficulty: string | null;
    transcript: string | null;
}

interface PodcastCategory {
    id: string;
    name: string;
    slug: string;
}

const podcastThumbnails: Record<string, string> = {
    "toeic": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=600&fit=crop",
    "ielts": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=600&fit=crop",
    "default": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=600&fit=crop",
};

// Sample audio for demo
const sampleAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const PodcastDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [showTranscript, setShowTranscript] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);

    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

    // Fetch podcast
    const { data: podcast, isLoading } = useQuery({
        queryKey: ["podcast", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("podcasts")
                .select("*")
                .eq("slug", slug)
                .maybeSingle();
            if (error) throw error;
            return data as Podcast | null;
        },
    });

    // Fetch category
    const { data: category } = useQuery({
        queryKey: ["podcast-category", podcast?.category_id],
        queryFn: async () => {
            if (!podcast?.category_id) return null;
            const { data, error } = await supabase
                .from("podcast_categories")
                .select("*")
                .eq("id", podcast.category_id)
                .maybeSingle();
            if (error) throw error;
            return data as PodcastCategory | null;
        },
        enabled: !!podcast?.category_id,
    });

    // Fetch related podcasts
    const { data: relatedPodcasts } = useQuery({
        queryKey: ["related-podcasts", podcast?.category_id, podcast?.id],
        queryFn: async () => {
            if (!podcast?.category_id) return [];
            const { data, error } = await supabase
                .from("podcasts")
                .select("*")
                .eq("category_id", podcast.category_id)
                .neq("id", podcast.id)
                .limit(5);
            if (error) throw error;
            return data as Podcast[];
        },
        enabled: !!podcast?.category_id,
    });

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => {
            if (isRepeat) {
                audio.currentTime = 0;
                audio.play();
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [isRepeat]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (value: number[]) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
    };

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
        setIsMuted(false);
    };

    const skipForward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    };

    const skipBackward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getThumbnail = (pod: Podcast) => {
        if (pod.thumbnail_url) return pod.thumbnail_url;
        if (pod.title.toLowerCase().includes("toeic")) return podcastThumbnails.toeic;
        if (pod.title.toLowerCase().includes("ielts")) return podcastThumbnails.ielts;
        return podcastThumbnails.default;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!podcast) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <Headphones className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Không tìm thấy podcast</h2>
                        <Link to="/podcasts">
                            <Button>Quay lại danh sách</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
            <Header />

            <main className="flex-1">
                {/* Hero Section with Gradient Background */}
                <div className="relative bg-gradient-to-br from-primary/10 via-purple-500/5 to-background border-b border-border/50 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />

                    <div className="container mx-auto px-4 py-8 relative">
                        {/* Back Button */}
                        <Link to="/podcasts" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Podcasts</span>
                        </Link>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left: Podcast Info */}
                            <div className="lg:col-span-8">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-72 flex-shrink-0">
                                        <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/20 relative group">
                                            <img
                                                src={getThumbnail(podcast)}
                                                alt={podcast.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {category && (
                                                <Badge variant="secondary" className="gap-1.5">
                                                    <BookOpen className="w-3 h-3" />
                                                    {category.name}
                                                </Badge>
                                            )}
                                            {podcast.difficulty && (
                                                <Badge variant={
                                                    podcast.difficulty === 'Advanced' ? 'destructive' :
                                                        podcast.difficulty === 'Intermediate' ? 'default' : 'secondary'
                                                }>
                                                    {podcast.difficulty}
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="gap-1.5">
                                                <ListOrdered className="w-3 h-3" />
                                                Episode {podcast.episode_number}
                                            </Badge>
                                        </div>

                                        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                            {podcast.title}
                                        </h1>

                                        <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                                            {podcast.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                                            {podcast.host_name && (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>{podcast.host_name}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatTime(podcast.duration_seconds || 0)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Headphones className="w-4 h-4" />
                                                <span>{podcast.listen_count?.toLocaleString()} plays</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Heart className="w-4 h-4" />
                                                Save
                                            </Button>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Share2 className="w-4 h-4" />
                                                Share
                                            </Button>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Download className="w-4 h-4" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Modern Audio Player */}
                                <Card className="mt-8 border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <audio ref={audioRef} src={podcast.audio_url || sampleAudioUrl} />

                                        {/* Progress Bar */}
                                        <div className="mb-6">
                                            <Slider
                                                value={[currentTime]}
                                                max={duration || 100}
                                                step={0.1}
                                                onValueChange={handleSeek}
                                                className="cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                <span className="font-medium">{formatTime(currentTime)}</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setIsRepeat(!isRepeat)}
                                                    className={isRepeat ? "text-primary" : ""}
                                                >
                                                    <Repeat className="w-5 h-5" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={skipBackward}
                                                >
                                                    <SkipBack className="w-5 h-5" />
                                                </Button>

                                                <Button
                                                    onClick={togglePlay}
                                                    size="lg"
                                                    className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="w-7 h-7" />
                                                    ) : (
                                                        <Play className="w-7 h-7 ml-1" />
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={skipForward}
                                                >
                                                    <SkipForward className="w-5 h-5" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Playback Speed */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-1.5 font-medium min-w-[60px]"
                                                        >
                                                            <Gauge className="w-4 h-4" />
                                                            {playbackRate}x
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {playbackRates.map((rate) => (
                                                            <DropdownMenuItem
                                                                key={rate}
                                                                onClick={() => setPlaybackRate(rate)}
                                                                className={playbackRate === rate ? "bg-accent font-medium" : ""}
                                                            >
                                                                {rate}x {rate === 1 && "(Normal)"}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setIsMuted(!isMuted)}
                                                >
                                                    {isMuted || volume === 0 ? (
                                                        <VolumeX className="w-5 h-5" />
                                                    ) : (
                                                        <Volume2 className="w-5 h-5" />
                                                    )}
                                                </Button>
                                                <Slider
                                                    value={[isMuted ? 0 : volume]}
                                                    max={1}
                                                    step={0.1}
                                                    onValueChange={handleVolumeChange}
                                                    className="w-24"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transcript Section */}
                                <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-primary" />
                                                Transcript
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowTranscript(!showTranscript)}
                                            >
                                                {showTranscript ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 mr-1" />
                                                        Hide
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 mr-1" />
                                                        Show
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {showTranscript && (
                                            <div className="max-h-96 overflow-y-auto pr-2">
                                                <SyncedTranscript
                                                    transcript={podcast.transcript}
                                                    currentTime={currentTime}
                                                    onSeek={(time) => {
                                                        if (audioRef.current) {
                                                            audioRef.current.currentTime = time;
                                                            setCurrentTime(time);
                                                            if (!isPlaying) {
                                                                audioRef.current.play();
                                                                setIsPlaying(true);
                                                            }
                                                        }
                                                    }}
                                                    duration={duration}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Related Podcasts */}
                            <div className="lg:col-span-4">
                                <Card className="sticky top-4 border-border/50 bg-card/50 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Headphones className="w-5 h-5 text-primary" />
                                            Related Episodes
                                        </h3>
                                        <div className="space-y-3">
                                            {relatedPodcasts?.map((pod) => (
                                                <Link
                                                    key={pod.id}
                                                    to={`/podcast/${pod.slug}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border/20">
                                                        <img
                                                            src={getThumbnail(pod)}
                                                            alt={pod.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                            {pod.title}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Ep. {pod.episode_number} • {formatTime(pod.duration_seconds || 0)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}

                                            {(!relatedPodcasts || relatedPodcasts.length === 0) && (
                                                <p className="text-muted-foreground text-sm text-center py-4">
                                                    No related podcasts
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PodcastDetail;
