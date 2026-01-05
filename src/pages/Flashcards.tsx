import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { FlashcardSet } from "@/types";
import { useFlashcardData } from "@/hooks/useFlashcardData";
import { FlashcardList } from "@/components/flashcard/FlashcardList";
import { FlashcardStudy } from "@/components/flashcard/FlashcardStudy";

const Flashcards = () => {
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    sets,
    setsLoading,
    cards,
    userProgress
  } = useFlashcardData(selectedSet?.id);

  // Calculate stats
  const totalCards = sets?.reduce((sum, set) => sum + (set.card_count || 0), 0) || 0;
  const totalRemembered = userProgress?.filter((p: any) => p.is_remembered).length || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {!selectedSet ? (
          <FlashcardList
            sets={sets || []}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectSet={setSelectedSet}
            user={{}} // Auth context handles user, purely for conditional rendering in list
            totalCards={totalCards}
            totalRemembered={totalRemembered}
            isLoading={setsLoading}
          />
        ) : (
          <FlashcardStudy
            set={selectedSet}
            cards={cards || []}
            userProgress={userProgress || []}
            onExit={() => setSelectedSet(null)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Flashcards;
