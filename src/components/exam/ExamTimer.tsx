import { Clock } from 'lucide-react';

interface ExamTimerProps {
    timeLeft: number;
    formatTime: (seconds: number) => string;
}

export const ExamTimer = ({ timeLeft, formatTime }: ExamTimerProps) => {
    return (
        <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg ${timeLeft <= 60 ? 'bg-red-500/20 text-red-500' : 'bg-muted'
            }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold text-sm md:text-base">{formatTime(timeLeft)}</span>
        </div>
    );
};
