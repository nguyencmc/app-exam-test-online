import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LuckyWheelProps {
    onWin: (points: number) => void;
}

export const LuckyWheel = ({ onWin }: LuckyWheelProps) => {
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const { toast } = useToast();

    const handleSpin = () => {
        if (spinning) return;

        setSpinning(true);
        const newRotation = rotation + 1800 + Math.random() * 360; // Spin at least 5 times
        setRotation(newRotation);

        setTimeout(() => {
            setSpinning(false);
            const points = Math.floor(Math.random() * 100) + 10;
            onWin(points);
            toast({
                title: "🎉 Chúc mừng!",
                description: `Bạn nhận được ${points} điểm thưởng!`,
                duration: 3000,
            });
        }, 5000); // 5 seconds spin
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50 hover:bg-yellow-500/20">
                    <Gift className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400">Vòng quay may mắn</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Vòng Quay May Mắn
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div className="relative w-64 h-64 mb-8">
                        {/* Wheel */}
                        <div
                            className="w-full h-full rounded-full border-8 border-yellow-500 shadow-xl transition-transform duration-[5000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                background: 'conic-gradient(from 0deg, #FF6B6B 0 60deg, #4ECDC4 60deg 120deg, #45B7D1 120deg 180deg, #96CEB4 180deg 240deg, #FFEEAD 240deg 300deg, #D4A5A5 300deg 360deg)'
                            }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-white z-10" />
                            </div>
                        </div>
                        {/* Pointer */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-20">
                            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-600 filter drop-shadow-md" />
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleSpin}
                        disabled={spinning}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg shadow-lg transform active:scale-95 transition-all"
                    >
                        {spinning ? "Đang quay..." : "QUAY NGAY"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        Quay mỗi ngày để nhận điểm thưởng và mở khóa tính năng mới!
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
