import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { FloatingActions } from "@/components/FloatingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Headphones,
  Clock,
  Play,
  Filter,
  ChevronDown,
  Sparkles,
  Volume2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PodcastCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  listen_count: number | null;
  difficulty: string | null;
  created_at: string;
}

const podcastThumbnails: Record<string, string> = {
  "toeic": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop",
  "ielts": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop",
  "default": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop",
};

const Podcasts = () => {
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    fetchData();
  }, [selectedCategory, difficulty]);

  const fetchData = async () => {
    setLoading(true);

    const { data: categoriesData } = await supabase
      .from("podcast_categories")
      .select("*")
      .order("display_order", { ascending: true });

    setCategories(categoriesData || []);

    let podcastQuery = supabase.from("podcasts").select("*");

    if (selectedCategory !== "all") {
      const category = categoriesData?.find(c => c.slug === selectedCategory);
      if (category) {
        podcastQuery = podcastQuery.eq("category_id", category.id);
      }
    }

    if (difficulty !== "all") {
      podcastQuery = podcastQuery.eq("difficulty", difficulty);
    }

    podcastQuery = podcastQuery.order("listen_count", { ascending: false });

    const { data: podcastsData } = await podcastQuery;
    setPodcasts(podcastsData || []);

    setLoading(false);
  };

  const filteredPodcasts = podcasts.filter((pod) =>
    pod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pod.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getThumbnail = (podcast: Podcast) => {
    if (podcast.thumbnail_url) return podcast.thumbnail_url;
    if (podcast.title.toLowerCase().includes("toeic")) return podcastThumbnails.toeic;
    if (podcast.title.toLowerCase().includes("ielts")) return podcastThumbnails.ielts;
    return podcastThumbnails.default;
  };

  const getDifficultyColor = (diff: string | null) => {
    switch (diff) {
      case 'Advanced': return 'bg-rose-500';
      case 'Intermediate': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-50"></div>

          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 border border-white/20">
                <Volume2 className="w-4 h-4" />
                <span>Luyện nghe tiếng Anh hiệu quả</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Podcast Library
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Cải thiện kỹ năng nghe của bạn với bộ sưu tập podcast được tuyển chọn.
                Luyện tập Dictation, học từ vựng và phát âm chuẩn.
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm podcast..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border-0 bg-white shadow-xl text-slate-900 placeholder:text-slate-400 text-base focus-visible:ring-2 focus-visible:ring-white/50"
                />
              </div>
            </div>
          </div>

          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-slate-50 dark:fill-slate-950" />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4 relative z-10">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800 p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              {/* Category Tabs */}
              <div className="flex-1 flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <Button
                  variant={selectedCategory === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full whitespace-nowrap"
                >
                  Tất cả
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.slug ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className="rounded-full whitespace-nowrap"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 shrink-0">
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-[150px] rounded-full border-slate-200 dark:border-slate-700">
                    <Filter className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cấp độ</SelectItem>
                    <SelectItem value="Beginner">Cơ bản</SelectItem>
                    <SelectItem value="Intermediate">Trung cấp</SelectItem>
                    <SelectItem value="Advanced">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{filteredPodcasts.length}</span> kết quả
            </p>
          </div>

          {/* Podcast Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800">
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPodcasts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPodcasts.map((podcast) => (
                <Link
                  key={podcast.id}
                  to={`/podcast/${podcast.slug}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-800">
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={getThumbnail(podcast)}
                        alt={podcast.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Level Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-lg ${getDifficultyColor(podcast.difficulty)}`}>
                          {podcast.difficulty || "Beginner"}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                          <Clock className="w-3 h-3" />
                          {formatDuration(podcast.duration_seconds)}
                        </span>
                      </div>

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-6 h-6 ml-1 fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          Dictation Practice
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {podcast.title}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {podcast.description || "Luyện nghe và chép chính tả với bài podcast này."}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Headphones className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatNumber(podcast.listen_count)}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Free
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Headphones className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Không tìm thấy podcast
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setDifficulty("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </main >

      <FloatingActions />
      <Footer />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div >
  );
};

export default Podcasts;
