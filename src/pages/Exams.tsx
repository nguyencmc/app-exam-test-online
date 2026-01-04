import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Star,
  Users,
  HelpCircle,
  Layers,
  Filter,
  RotateCcw,
  FileText,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  exam_count: number | null;
  attempt_count: number | null;
  question_count: number | null;
  subcategory_count: number | null;
  rating: number | null;
  is_featured: boolean | null;
}

interface Exam {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  question_count: number | null;
  attempt_count: number | null;
  category_id: string | null;
}

const categoryIcons: Record<string, string> = {
  aws: "🔶",
  toeic: "🇺🇸",
  ielts: "🇬🇧",
  tester: "✅",
  hsk: "🇨🇳",
  jlpt: "🇯🇵",
  topik: "🇰🇷",
  ba: "📊",
  pmp: "📋",
  comptia: "💻",
  cisco: "🌐",
  azure: "☁️",
};

const Exams = () => {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("attempts");
  const [publisher, setPublisher] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const fetchData = async () => {
    setLoading(true);

    // Use database views for optimized statistics (single query instead of N+1)
    // Falls back to regular table if view doesn't exist
    let categoryQuery = supabase.from("category_stats_view").select("*");
    let examQuery = supabase.from("exam_stats_view").select("*");

    // Apply sorting
    if (sortBy === "attempts") {
      categoryQuery = categoryQuery.order("attempt_count", { ascending: false });
      examQuery = examQuery.order("attempt_count", { ascending: false });
    } else if (sortBy === "exams") {
      categoryQuery = categoryQuery.order("exam_count", { ascending: false });
    } else if (sortBy === "rating") {
      categoryQuery = categoryQuery.order("rating", { ascending: false });
    } else if (sortBy === "name") {
      categoryQuery = categoryQuery.order("name", { ascending: true });
    }

    const [categoryResult, examResult] = await Promise.all([
      categoryQuery,
      examQuery
    ]);

    if (categoryResult.error) {
      console.error("Error fetching categories:", categoryResult.error);
      // Fallback to original table if view doesn't exist
      const fallbackResult = await supabase.from("exam_categories").select("*");
      if (!fallbackResult.error) {
        setCategories(fallbackResult.data || []);
      }
    } else {
      setCategories(categoryResult.data || []);
    }

    if (examResult.error) {
      console.error("Error fetching exams:", examResult.error);
      // Fallback to original table if view doesn't exist
      const fallbackResult = await supabase.from("exams").select("*").order("attempt_count", { ascending: false });
      if (!fallbackResult.error) {
        setExams(fallbackResult.data || []);
      }
    } else {
      setExams(examResult.data || []);
    }

    setLoading(false);
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" ||
      (categoryFilter === "with-sub" && (cat.subcategory_count || 0) > 0) ||
      (categoryFilter === "without-sub" && (cat.subcategory_count || 0) === 0);
    return matchesSearch && matchesCategory;
  });

  const getExamsByCategory = (categoryId: string) => {
    return exams.filter(exam => exam.category_id === categoryId).slice(0, 6);
  };

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("attempts");
    setPublisher("all");
    setCategoryFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl border-2 border-border focus:border-primary bg-card"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-card rounded-2xl p-6 mb-8 border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Filter and Sort</h3>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 bg-muted/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attempts">Most Attempts</SelectItem>
                <SelectItem value="attempts-asc">Least Attempts</SelectItem>
                <SelectItem value="exams">Most Exams</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={publisher} onValueChange={setPublisher}>
              <SelectTrigger className="w-44 bg-muted/50">
                <SelectValue placeholder="Publisher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Publishers</SelectItem>
                <SelectItem value="official">The Best Study</SelectItem>
                <SelectItem value="community">End Users</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-muted/50">
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="with-sub">With Subcategories</SelectItem>
                <SelectItem value="without-sub">Without Subcategories</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-40 bg-muted"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              No categories found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/exams/${category.slug}`}
                className="bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group block"
              >
                {/* Category Header */}
                <div className="h-36 relative flex items-center justify-center">
                  {/* Exam Count Badge */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold text-sm">
                      {category.exam_count || 0}
                    </span>
                  </div>

                  {/* Category Icon */}
                  <div className="text-6xl drop-shadow-lg">
                    {categoryIcons[category.slug] || "📚"}
                  </div>
                </div>

                {/* Category Info */}
                <div className="bg-card p-5 rounded-t-3xl -mt-4 relative">
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(category.rating || 5)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      {category.rating || 5}/5
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>
                        <strong className="text-foreground">
                          {formatNumber(category.attempt_count)}
                        </strong>{" "}
                        attempts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-accent" />
                      <span>
                        <strong className="text-foreground">
                          {formatNumber(category.question_count)}
                        </strong>{" "}
                        questions
                      </span>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {category.subcategory_count !== null && category.subcategory_count >= 0 && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                        <Layers className="w-4 h-4" />
                        <span>Subcategories</span>
                      </div>
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-semibold">
                        {category.subcategory_count}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Explore in Detail Section */}
        {!loading && filteredCategories.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-2">Explore in Detail</h2>
              <p className="text-muted-foreground">View all subcategories and topics</p>
            </div>

            <div className="space-y-8">
              {filteredCategories.map((category) => {
                const categoryExams = getExamsByCategory(category.id);

                return (
                  <div
                    key={category.id}
                    id={`category-${category.slug}`}
                    className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm"
                  >
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent p-6 border-b border-border/50">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                          {categoryIcons[category.slug] || "📚"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-foreground mb-2">
                                {category.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <span className="font-semibold text-primary">{category.exam_count || 0}</span>
                                  <span>Exams</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1 rounded-full">
                                  <HelpCircle className="w-4 h-4 text-accent" />
                                  <span className="font-semibold text-accent">{formatNumber(category.question_count)}</span>
                                  <span>questions</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1 rounded-full">
                                  <Users className="w-4 h-4 text-orange-500" />
                                  <span className="font-semibold text-orange-500">{formatNumber(category.attempt_count)}</span>
                                  <span>attempts</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-full">
                                  <Layers className="w-4 h-4 text-blue-500" />
                                  <span className="font-semibold text-blue-500">{category.subcategory_count || 0}</span>
                                  <span>Subcategories</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(category.rating || 5)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                      }`}
                                  />
                                ))}
                                <span className="text-sm font-medium ml-1">{category.rating || 5}/5</span>
                              </div>
                              <Link to={`/exams/${category.slug}`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  View all
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exams Grid */}
                    {categoryExams.length > 0 ? (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryExams.map((exam) => (
                            <Link
                              key={exam.id}
                              to={`/exam/${exam.slug}`}
                              className="group flex items-center justify-between p-4 bg-muted/50 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/20 transition-all"
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {exam.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    {exam.question_count || 0} questions
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    {exam.attempt_count || 0}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                        {categoryExams.length < (category.exam_count || 0) && (
                          <div className="mt-4 text-center">
                            <Link to={`/exams/${category.slug}`}>
                              <Button variant="ghost" className="text-primary hover:text-primary/80">
                                View all {category.exam_count} exams
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <p>No exams available in this category yet</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default Exams;