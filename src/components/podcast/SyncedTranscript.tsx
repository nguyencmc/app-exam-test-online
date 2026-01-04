import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TranscriptLine {
  id: number;
  startTime: number; // in seconds
  endTime: number;
  text: string;
}

interface SyncedTranscriptProps {
  transcript: string | null;
  currentTime: number;
  onSeek: (time: number) => void;
  duration: number;
}

// Parse transcript text into timed segments
// Format expected: "[00:00] Text" or plain text (auto-split by sentences)
const parseTranscript = (transcript: string, duration: number): TranscriptLine[] => {
  const lines: TranscriptLine[] = [];
  
  // Check if transcript has timestamps like [00:00] or [0:00:00]
  const timestampRegex = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g;
  const hasTimestamps = timestampRegex.test(transcript);
  
  if (hasTimestamps) {
    // Parse timestamps
    const segments = transcript.split(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/).filter(Boolean);
    let id = 0;
    
    for (let i = 0; i < segments.length; i += 2) {
      const timeStr = segments[i];
      const text = segments[i + 1]?.trim();
      
      if (timeStr && text) {
        const timeParts = timeStr.split(':').map(Number);
        let startTime = 0;
        
        if (timeParts.length === 3) {
          startTime = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else {
          startTime = timeParts[0] * 60 + timeParts[1];
        }
        
        lines.push({
          id: id++,
          startTime,
          endTime: 0, // Will be calculated
          text
        });
      }
    }
    
    // Calculate end times
    for (let i = 0; i < lines.length; i++) {
      lines[i].endTime = lines[i + 1]?.startTime || duration;
    }
  } else {
    // Auto-split by sentences/paragraphs
    const sentences = transcript
      .split(/(?<=[.!?])\s+|\n+/)
      .filter(s => s.trim().length > 0);
    
    const segmentDuration = duration / sentences.length;
    
    sentences.forEach((text, index) => {
      lines.push({
        id: index,
        startTime: index * segmentDuration,
        endTime: (index + 1) * segmentDuration,
        text: text.trim()
      });
    });
  }
  
  return lines;
};

export const SyncedTranscript = ({
  transcript,
  currentTime,
  onSeek,
  duration
}: SyncedTranscriptProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcript) {
      // Use duration if available, otherwise use a default based on transcript with timestamps
      const effectiveDuration = duration > 0 ? duration : 300; // 5 min default
      setLines(parseTranscript(transcript, effectiveDuration));
    }
  }, [transcript, duration]);

  useEffect(() => {
    // Find current active line based on currentTime
    const currentLine = lines.find(
      line => currentTime >= line.startTime && currentTime < line.endTime
    );
    
    if (currentLine && currentLine.id !== activeLineId) {
      setActiveLineId(currentLine.id);
    }
  }, [currentTime, lines, activeLineId]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const lineRect = activeLine.getBoundingClientRect();
      
      // Check if the active line is outside the visible area
      const isAbove = lineRect.top < containerRect.top;
      const isBelow = lineRect.bottom > containerRect.bottom;
      
      if (isAbove || isBelow) {
        activeLine.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLineId]);

  if (!transcript || lines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Chưa có transcript cho podcast này</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-[400px] overflow-y-auto pr-2 space-y-3 scroll-smooth custom-scrollbar"
    >
      {lines.map((line) => {
        const isActive = line.id === activeLineId;
        const isPast = currentTime > line.endTime;
        
        return (
          <div
            key={line.id}
            ref={isActive ? activeLineRef : null}
            onClick={() => onSeek(line.startTime)}
            className={cn(
              "p-4 rounded-xl cursor-pointer transition-all duration-300 border",
              isActive
                ? "bg-primary/10 border-primary/30 scale-[1.02] shadow-lg"
                : isPast
                ? "bg-muted/30 border-transparent opacity-60"
                : "bg-muted/10 border-transparent hover:bg-muted/30 hover:border-muted/50"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Time indicator */}
              <span 
                className={cn(
                  "text-xs font-mono px-2 py-1 rounded-md flex-shrink-0",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {formatTime(line.startTime)}
              </span>
              
              {/* Text */}
              <p 
                className={cn(
                  "text-base leading-relaxed transition-colors",
                  isActive 
                    ? "text-foreground font-medium" 
                    : isPast 
                    ? "text-muted-foreground" 
                    : "text-foreground/80"
                )}
              >
                {line.text}
              </p>
            </div>
            
            {/* Progress indicator for active line */}
            {isActive && (
              <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.min(100, ((currentTime - line.startTime) / (line.endTime - line.startTime)) * 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
