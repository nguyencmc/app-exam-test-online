// Anti-Cheat Status Component
// Shows violation count and fullscreen status

import { Shield, ShieldAlert, Maximize, MinimizeIcon, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAntiCheat, AntiCheatViolation } from '@/hooks/useAntiCheat';

interface AntiCheatStatusProps {
    enabled?: boolean;
    onViolation?: (violation: AntiCheatViolation) => void;
    showDetails?: boolean;
}

export function AntiCheatStatus({
    enabled = true,
    onViolation,
    showDetails = false,
}: AntiCheatStatusProps) {
    const {
        isFullscreen,
        violations,
        tabSwitchCount,
        enterFullscreen,
        exitFullscreen,
    } = useAntiCheat({ enabled, onViolation });

    const hasViolations = violations.length > 0;

    return (
        <div className={`p-3 rounded-xl border ${hasViolations
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {hasViolations ? (
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                    ) : (
                        <Shield className="w-5 h-5 text-green-500" />
                    )}
                    <span className={`font-medium ${hasViolations ? 'text-red-600' : 'text-green-600'}`}>
                        {hasViolations ? 'Phát hiện vi phạm' : 'Đang giám sát'}
                    </span>
                </div>

                {/* Fullscreen toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                    className="h-8 px-2"
                >
                    {isFullscreen ? (
                        <MinimizeIcon className="w-4 h-4" />
                    ) : (
                        <Maximize className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm">
                <Badge variant={isFullscreen ? 'default' : 'secondary'}>
                    <Maximize className="w-3 h-3 mr-1" />
                    {isFullscreen ? 'Fullscreen' : 'Windowed'}
                </Badge>

                <Badge variant={tabSwitchCount > 0 ? 'destructive' : 'secondary'}>
                    <Eye className="w-3 h-3 mr-1" />
                    Tab: {tabSwitchCount}
                </Badge>

                {violations.length > 0 && (
                    <Badge variant="destructive">
                        Vi phạm: {violations.length}
                    </Badge>
                )}
            </div>

            {/* Violation details */}
            {showDetails && violations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-500/20">
                    <p className="text-xs text-muted-foreground mb-2">Chi tiết vi phạm:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {violations.slice(-5).map((v, i) => (
                            <div key={i} className="text-xs text-red-600">
                                • {v.type} - {new Date(v.timestamp).toLocaleTimeString()}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AntiCheatStatus;
