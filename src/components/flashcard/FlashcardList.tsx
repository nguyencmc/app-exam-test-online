import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FlashcardSet } from "@/types";
import { LuckyWheel } from "@/components/flashcard/LuckyWheel";
import { Link } from "react-router-dom";
import {
    Sparkles,
    Brain,
    Layers,
    BookOpen,
    Check,
    TrendingUp,
    Search,
    Play
} from "lucide-react";

interface FlashcardListProps {
    sets: FlashcardSet[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    onSelectSet: (set: FlashcardSet) => void;
    user: any;
    totalCards: number;
    totalRemembered: number;
    isLoading: boolean;
}

export const FlashcardList = ({
    sets,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    onSelectSet,
    user,
    totalCards,
    totalRemembered,
    isLoading
}: FlashcardListProps) => {
    // Get unique categories
    const categories = sets ? [...new Set(sets.map(s => s.category).filter(Boolean))] : [];

    // Filter sets
    const filteredSets = sets?.filter(set => {
        const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (set.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesCategory = selectedCategory === "all" || set.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleLuckyWin = (points: number) => {
        console.log("Won points:", points);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1">
            {/* Hero Section */}
            <section className="relative py-12 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Học thông minh hơn với Flashcards</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Flashcards
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Ghi nhớ hiệu quả với phương pháp thẻ ghi nhớ và Spaced Repetition
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            {user && (
                                <Link to="/flashcards/review">
                                    <Button size="lg" className="gap-2 shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90">
                                        <Brain className="w-5 h-5" />
                                        Ôn tập ngay
                                    </Button>
                                </Link>
                            )}
                            <LuckyWheel onWin={handleLuckyWin} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="py-8 border-b border-border/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Layers className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{sets?.length || 0}</p>
                                        <p className="text-xs text-muted-foreground">Bộ thẻ</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <BookOpen className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{totalCards}</p>
                                        <p className="text-xs text-muted-foreground">Tổng thẻ</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <Check className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{totalRemembered}</p>
                                        <p className="text-xs text-muted-foreground">Đã nhớ</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <TrendingUp className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {totalCards > 0 ? Math.round((totalRemembered / totalCards) * 100) : 0}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">Tiến độ</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Sets List */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm bộ thẻ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <Button
                                variant={selectedCategory === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory("all")}
                                className="shrink-0"
                            >
                                Tất cả
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category || "all")}
                                    className="shrink-0"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Sets Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSets?.map((set) => (
                            <Card
                                key={set.id}
                                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 group overflow-hidden"
                                onClick={() => onSelectSet(set)}
                            >
                                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                                                {set.title}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {set.description}
                                            </p>
                                        </div>
                                        {set.category && (
                                            <Badge variant="secondary" className="uppercase text-xs shrink-0 ml-2">
                                                {set.category}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Layers className="w-4 h-4" />
                                                <span>{set.card_count} thẻ</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Play className="w-4 h-4" />
                                            Học ngay
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredSets?.length === 0 && (
                        <Card className="text-center py-16">
                            <CardContent>
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                                    <Layers className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchQuery || selectedCategory !== "all"
                                        ? "Không tìm thấy bộ thẻ nào"
                                        : "Chưa có bộ thẻ nào"}
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchQuery || selectedCategory !== "all"
                                        ? "Thử tìm kiếm với từ khóa khác"
                                        : "Các bộ flashcard sẽ xuất hiện ở đây"}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
};
