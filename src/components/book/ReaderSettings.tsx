import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Settings, Type, Sun, Moon, Clock, BookOpen, Check } from 'lucide-react';

interface ReaderSettingsProps {
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    isDarkMode: boolean;
    onDarkModeChange: (isDark: boolean) => void;
    readingTime: number;
    readingPercentage: number;
    isCompleted?: boolean;
    canMarkComplete: boolean;
    onMarkComplete: () => void;
    formatTime: (seconds: number) => string;
}

export const ReaderSettings = ({
    fontSize,
    onFontSizeChange,
    isDarkMode,
    onDarkModeChange,
    readingTime,
    readingPercentage,
    isCompleted,
    canMarkComplete,
    onMarkComplete,
    formatTime,
}: ReaderSettingsProps) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Reading Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    {/* Font Size */}
                    <div>
                        <label className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Font Size: {fontSize}px
                        </label>
                        <Slider
                            value={[fontSize]}
                            min={14}
                            max={28}
                            step={2}
                            onValueChange={([value]) => onFontSizeChange(value)}
                            className="mt-2"
                        />
                    </div>

                    {/* Theme */}
                    <div>
                        <label className="text-sm font-medium mb-3 block">Theme</label>
                        <div className="flex gap-2">
                            <Button
                                variant={!isDarkMode ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => onDarkModeChange(false)}
                            >
                                <Sun className="h-4 w-4 mr-2" />
                                Light
                            </Button>
                            <Button
                                variant={isDarkMode ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => onDarkModeChange(true)}
                            >
                                <Moon className="h-4 w-4 mr-2" />
                                Dark
                            </Button>
                        </div>
                    </div>

                    {/* Reading Stats */}
                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-4">Reading Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 rounded-lg bg-muted">
                                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                                <p className="text-lg font-bold">{formatTime(readingTime)}</p>
                                <p className="text-xs text-muted-foreground">Time Spent</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted">
                                <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                                <p className="text-lg font-bold">{readingPercentage}%</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Mark as Complete */}
                    {canMarkComplete && !isCompleted && (
                        <Button className="w-full" onClick={onMarkComplete}>
                            <Check className="h-4 w-4 mr-2" />
                            Mark as Completed
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
