import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { 
  ArrowLeft, 
  BookOpen, 
  Star, 
  Eye, 
  User, 
  Heart, 
  Share2, 
  Download,
  Clock,
  ChevronRight
} from "lucide-react";

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

interface BookCategory {
  id: string;
  name: string;
  slug: string;
}

const BookDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Book | null;
    },
  });

  const { data: category } = useQuery({
    queryKey: ["book-category", book?.category_id],
    queryFn: async () => {
      if (!book?.category_id) return null;
      const { data, error } = await supabase
        .from("book_categories")
        .select("*")
        .eq("id", book.category_id)
        .maybeSingle();
      if (error) throw error;
      return data as BookCategory | null;
    },
    enabled: !!book?.category_id,
  });

  const { data: relatedBooks } = useQuery({
    queryKey: ["related-books", book?.category_id, book?.id],
    queryFn: async () => {
      if (!book?.category_id) return [];
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("category_id", book.category_id)
        .neq("id", book.id)
        .limit(6);
      if (error) throw error;
      return data as Book[];
    },
    enabled: !!book?.category_id,
  });

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    return num.toLocaleString();
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCover = (b: Book) => {
    return b.cover_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-32 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="aspect-[3/4] bg-muted rounded-lg"></div>
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-10 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Book not found</h1>
            <p className="text-muted-foreground mb-6">The book you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/books")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/books")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/books" className="hover:text-foreground transition-colors">Books</Link>
            {category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="hover:text-foreground transition-colors">{category.name}</span>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{book.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cover Image */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img
                  src={getCover(book)}
                  alt={book.title}
                  className="w-full aspect-[3/4] object-cover"
                />
                {book.rating && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-white font-medium">{book.rating}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Author */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {book.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{book.author_name || "Unknown Author"}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge variant="secondary">{category.name}</Badge>
                )}
                {book.difficulty && (
                  <Badge className={getDifficultyColor(book.difficulty)} variant="outline">
                    {book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1)}
                  </Badge>
                )}
                {book.is_featured && (
                  <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reads</p>
                    <p className="font-semibold text-foreground">{formatNumber(book.read_count)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pages</p>
                    <p className="font-semibold text-foreground">{book.page_count || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Reading</p>
                    <p className="font-semibold text-foreground">{Math.ceil((book.page_count || 0) / 30)} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-semibold text-foreground">{book.rating || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Read Button */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => navigate(`/book/${slug}/read`)}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Read Book
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowContent(!showContent)}
                >
                  {showContent ? "Hide Preview" : "Preview Content"}
                </Button>
              </div>

              {/* Book Content Preview */}
              {showContent && book.content && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Content Preview</h2>
                  <ScrollArea className="h-[300px] rounded-lg border border-border p-6 bg-muted/30">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {book.content.slice(0, 2000)}
                        {book.content.length > 2000 && "..."}
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Related Books */}
              {relatedBooks && relatedBooks.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Related Books</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {relatedBooks.map((relatedBook) => (
                      <Link
                        key={relatedBook.id}
                        to={`/book/${relatedBook.slug}`}
                        className="group block"
                      >
                        <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                          <img
                            src={getCover(relatedBook)}
                            alt={relatedBook.title}
                            className="w-full aspect-[3/4] object-cover"
                          />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedBook.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
};

export default BookDetail;
