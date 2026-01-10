import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/layout";
import { FloatingActions } from "@/components/FloatingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { courseService } from "@/modules/course";
import { Course } from "@/types";
import { Search, Eye, Heart, List, Languages, FileText, Plus } from "lucide-react";
import { useAuth } from "@/modules/auth";
import { Link, useNavigate } from "react-router-dom";

const categories = [
  { id: "all", name: "Tất cả", icon: List },
  { id: "languages", name: "Ngôn ngữ", icon: Languages },
  { id: "exams", name: "Bài thi", icon: FileText },
];

const subcategories: Record<string, { id: string; name: string }[]> = {
  languages: [
    { id: "english", name: "Tiếng Anh" },
    { id: "japanese", name: "Tiếng Nhật" },
    { id: "korean", name: "Tiếng Hàn" },
    { id: "chinese", name: "Tiếng Trung" },
    { id: "french", name: "Tiếng Pháp" },
    { id: "german", name: "Tiếng Đức" },
  ],
  exams: [
    { id: "ielts", name: "IELTS" },
    { id: "toeic", name: "TOEIC" },
    { id: "jlpt", name: "JLPT" },
    { id: "hsk", name: "HSK" },
    { id: "topik", name: "TOPIK" },
  ],
};

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"official" | "community">("official");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedSubcategory, activeTab, searchQuery]);
  // Note: Added searchQuery to dependencies for live search, or could debounce

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await courseService.getCourses(1, 100, {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        is_official: activeTab === "official",
        search: searchQuery
      });
      setCourses(result.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-primary to-accent",
      "from-purple-500 to-pink-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-blue-500 to-indigo-500",
      "from-yellow-500 to-orange-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Khám phá kiến thức mới mỗi ngày
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Hàng ngàn khóa học chất lượng, từ flashcard đến trò chơi tương tác
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg" className="shadow-lg">
              Khám phá ngay
            </Button>
            {user && (
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Plus className="w-4 h-4 mr-2" />
                Tạo khóa học
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubcategory(null);
                }}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Subcategory Pills */}
        {selectedCategory !== "all" && subcategories[selectedCategory] && (
          <div className="flex flex-wrap gap-2 mb-6">
            {subcategories[selectedCategory].map((sub) => (
              <Button
                key={sub.id}
                variant={selectedSubcategory === sub.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  setSelectedSubcategory(
                    selectedSubcategory === sub.id ? null : sub.id
                  )
                }
              >
                {sub.name}
              </Button>
            ))}
          </div>
        )}

        {/* Official / Community Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-muted p-1">
            <Button
              variant={activeTab === "official" ? "default" : "ghost"}
              onClick={() => setActiveTab("official")}
              className="rounded-lg"
            >
              The Best Study
            </Button>
            <Button
              variant={activeTab === "community" ? "default" : "ghost"}
              onClick={() => setActiveTab("community")}
              className="rounded-lg"
            >
              Cộng đồng
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              {activeTab === "official" ? "Khóa học mới nhất" : "Từ cộng đồng"}
            </h2>
            <Link to="/courses" className="text-primary hover:underline flex items-center gap-1">
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-32 bg-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy khóa học nào
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 group cursor-pointer border border-border/50"
                >
                  {/* Course Image/Gradient */}
                  <div
                    className={`h-32 bg-gradient-to-br ${getGradientClass(
                      index
                    )} relative`}
                  >
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-black/10"></div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {course.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {course.term_count || 0} thuật ngữ
                      </span>
                      {course.subcategory && (
                        <span className="bg-muted px-2 py-1 rounded-full capitalize">
                          {course.subcategory}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {(course as any).profiles?.avatar_url ? ( // Use cast as profiles might not be in Course type strict definition yet
                            <img src={(course as any).profiles.avatar_url} alt="author" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {(course.creator_name || "T").charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {course.creator_name || (course as any).profiles?.full_name || "The Best Study"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {course.view_count || 0}
                        </span>
                        <button className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default Courses;
