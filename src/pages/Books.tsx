import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header, Footer } from "@/components/layout";
import { FloatingActions } from "@/components/FloatingActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Star,
  Eye,
  User,
  Library,
  Sparkles,
  TrendingUp,
  Clock,
  Grid3X3,
  List,
  BookMarked,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  book_count: number | null;
  display_order: number | null;
  is_featured: boolean | null;
  created_at: string;
}

interface Book {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author_name: string | null;
  cover_url: string | null;
  category_id: string | null;
  page_count: number | null;
  read_count: number | null;
  rating: number | null;
  difficulty: string | null;
  is_featured: boolean | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

type SortOption = "newest" | "popular" | "rating";
type ViewMode = "grid" | "list";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const Books = () => {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("book_categories")
        .select("*")
        .order("display_order");

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch books with sorting
      let booksQuery = supabase.from("books").select("*");

      if (selectedCategory) {
        booksQuery = booksQuery.eq("category_id", selectedCategory);
      }

      // Apply sorting
      switch (sortBy) {
        case "popular":
          booksQuery = booksQuery.order("read_count", { ascending: false, nullsFirst: false });
          break;
        case "rating":
          booksQuery = booksQuery.order("rating", { ascending: false, nullsFirst: false });
          break;
        default:
          booksQuery = booksQuery.order("created_at", { ascending: false });
      }

      const { data: booksData } = await booksQuery;

      if (booksData) {
        setBooks(booksData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const getCover = (book: Book) => {
    return book.cover_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop";
  };

  const totalBooks = books.length;
  const featuredBooks = books.filter(b => b.is_featured).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Floating Book Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <BookOpen className="absolute top-20 left-[10%] w-8 h-8 text-primary/20 animate-float" />
            <BookMarked className="absolute top-32 right-[15%] w-6 h-6 text-accent/20 animate-float delay-500" />
            <Library className="absolute bottom-20 left-[20%] w-10 h-10 text-primary/15 animate-float delay-1000" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Stats Badges */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-primary/10 text-primary border border-primary/20">
                <Library className="w-4 h-4 mr-2" />
                {totalBooks} Sách
              </Badge>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-accent/10 text-accent-foreground border border-accent/20">
                <Sparkles className="w-4 h-4 mr-2" />
                {categories.length} Thể loại
              </Badge>
            </div>

            {/* Title with Gradient */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                Thư Viện Sách
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Khám phá kho tàng tri thức với hàng trăm đầu sách chất lượng cao,
              được tuyển chọn kỹ lưỡng cho hành trình học tập của bạn
            </p>

            {/* Enhanced Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm sách, tác giả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-border/50 rounded-xl text-base shadow-lg shadow-primary/5 focus:shadow-primary/10 transition-shadow"
                />
              </div>

              <Select
                value={selectedCategory || "all"}
                onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-background/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <SelectValue placeholder="Thể loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thể loại</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-xl bg-background/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Mới nhất
                    </span>
                  </SelectItem>
                  <SelectItem value="popular">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Phổ biến
                    </span>
                  </SelectItem>
                  <SelectItem value="rating">
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4" /> Đánh giá cao
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Category Chips */}
        <section className="py-6 border-b border-border/50 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all px-4 py-2 rounded-full",
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "hover:bg-primary/10"
                  )}
                  onClick={() => setSelectedCategory(null)}
                >
                  Tất cả
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all px-4 py-2 rounded-full",
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "hover:bg-primary/10"
                    )}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                    {category.book_count && (
                      <span className="ml-1.5 text-xs opacity-70">({category.book_count})</span>
                    )}
                  </Badge>
                ))}
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Books Grid/List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                  : "flex flex-col gap-4"
              )}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={cn(
                    "animate-pulse",
                    viewMode === "list" && "flex gap-4 p-4 rounded-xl bg-muted/50"
                  )}>
                    <div className={cn(
                      "bg-muted rounded-xl",
                      viewMode === "grid" ? "aspect-[3/4] mb-3" : "w-24 h-32 shrink-0"
                    )} />
                    <div className={viewMode === "list" ? "flex-1 space-y-2" : ""}>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      {viewMode === "list" && <div className="h-3 bg-muted rounded w-full mt-2" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              /* Enhanced Empty State */
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Không tìm thấy sách
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác để khám phá thêm sách
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                  <Button onClick={() => fetchData()}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Xem tất cả sách
                  </Button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.slug}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={getCover(book)}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Featured Badge */}
                        {book.is_featured && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-2.5 py-1 text-xs font-medium shadow-lg">
                            <Sparkles className="h-3 w-3" />
                            Nổi bật
                          </div>
                        )}

                        {/* Rating Badge */}
                        {book.rating && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-white font-medium">{book.rating}</span>
                          </div>
                        )}

                        {/* Difficulty Badge */}
                        {book.difficulty && (
                          <div className={cn(
                            "absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded-full border backdrop-blur-sm",
                            difficultyColors[book.difficulty] || "bg-muted text-muted-foreground"
                          )}>
                            {difficultyLabels[book.difficulty] || book.difficulty}
                          </div>
                        )}

                        {/* Hover Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                          <div className="flex items-center gap-3 text-white text-xs">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(book.read_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {book.page_count || 0} trang
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {book.author_name || "Tác giả ẩn danh"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="flex flex-col gap-4">
                {filteredBooks.map((book) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.slug}`}
                    className="group flex gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={getCover(book)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            {book.author_name || "Tác giả ẩn danh"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {book.is_featured && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Nổi bật
                            </Badge>
                          )}
                          {book.rating && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {book.rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {book.description || "Chưa có mô tả cho cuốn sách này."}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(book.read_count)} lượt đọc
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {book.page_count || 0} trang
                        </span>
                        {book.difficulty && (
                          <Badge variant="outline" className={cn("text-xs", difficultyColors[book.difficulty])}>
                            {difficultyLabels[book.difficulty] || book.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 self-center" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <FloatingActions />

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default Books;
