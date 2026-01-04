import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gamepad2, Timer, Trophy, RefreshCcw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface GameCard {
    id: string;
    content: string;
    type: 'front' | 'back';
    matchId: string;
}

interface MatchingGameProps {
    cards: Array<{ id: string, front_text: string, back_text: string }>;
    onComplete: (score: number) => void;
}

export const MatchingGame = ({ cards, onComplete }: MatchingGameProps) => {
    const [gameCards, setGameCards] = useState<GameCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, startTime]);

    const startGame = () => {
        // Select random 6 pairs (12 cards) for the game
        const shuffledSource = [...cards].sort(() => 0.5 - Math.random()).slice(0, 6);

        const gameItems: Card[] = [];
        shuffledSource.forEach(card => {
            gameItems.push({ id: `${card.id}-f`, content: card.front_text, type: 'front', matchId: card.id });
            gameItems.push({ id: `${card.id}-b`, content: card.back_text, type: 'back', matchId: card.id });
        });

        // Shuffle game items
        setGameCards(gameItems.sort(() => 0.5 - Math.random()));
        setMatchedPairs([]);
        setSelectedCards([]);
        setIsPlaying(true);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCardClick = (index: number) => {
        if (selectedCards.length === 2 || selectedCards.includes(index) || matchedPairs.includes(gameCards[index].matchId)) return;

        const newSelected = [...selectedCards, index];
        setSelectedCards(newSelected);

        if (newSelected.length === 2) {
            const card1 = gameCards[newSelected[0]];
            const card2 = gameCards[newSelected[1]];

            if (card1.matchId === card2.matchId) {
                // Match found
                setMatchedPairs(prev => [...prev, card1.matchId]);
                setSelectedCards([]);

                // Check win condition
                if (matchedPairs.length + 1 === gameCards.length / 2) {
                    endGame();
                }
            } else {
                // No match
                setTimeout(() => setSelectedCards([]), 1000);
            }
        }
    };

    const endGame = () => {
        setIsPlaying(false);
        const score = Math.max(0, 1000 - timeElapsed * 10);
        onComplete(score);
        toast({
            title: "🏆 Hoàn thành!",
            description: `Bạn đã hoàn thành trong ${timeElapsed} giây. Điểm số: ${score}`,
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/50 hover:bg-purple-500/20">
                    <Gamepad2 className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400">Trò chơi ghép thẻ</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5 text-purple-500" />
                            Ghép thẻ - Nối thuật ngữ với định nghĩa
                        </div>
                        {isPlaying && (
                            <div className="flex items-center gap-2 text-lg font-mono bg-muted px-3 py-1 rounded">
                                <Timer className="w-4 h-4" />
                                {formatTime(timeElapsed)}
                            </div>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {!isPlaying ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <Gamepad2 className="w-24 h-24 text-purple-200 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Sẵn sàng thử thách?</h3>
                        <p className="text-muted-foreground mb-8 max-w-md">
                            Tìm và ghép các cặp thuật ngữ - định nghĩa tương ứng trong thời gian nhanh nhất có thể!
                        </p>
                        <Button size="lg" onClick={startGame} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                            <RefreshCcw className="w-4 h-4" />
                            Bắt đầu chơi
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-4 p-4 overflow-y-auto">
                        {gameCards.map((card, index) => {
                            const isSelected = selectedCards.includes(index);
                            const isMatched = matchedPairs.includes(card.matchId);

                            return (
                                <Card
                                    key={index}
                                    className={cn(
                                        "relative flex items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 h-32 select-none",
                                        isSelected && "ring-2 ring-purple-500 border-purple-500 bg-purple-50 dark:bg-purple-900/20 transform scale-105",
                                        isMatched && !isSelected && "opacity-0 pointer-events-none scale-0", // Match animation
                                        !isSelected && !isMatched && "hover:shadow-md hover:border-purple-300"
                                    )}
                                    onClick={() => handleCardClick(index)}
                                >
                                    <p className="text-sm font-medium line-clamp-4">
                                        {card.content}
                                    </p>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
