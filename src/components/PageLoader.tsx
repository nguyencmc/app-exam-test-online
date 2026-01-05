import { Loader2 } from "lucide-react";

export const PageLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Đang tải...
                </p>
            </div>
        </div>
    );
};
