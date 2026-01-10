// Anti-Cheat Hook for Exam Proctoring
// Handles fullscreen, tab switching, and copy/paste detection

import { useState, useEffect, useCallback } from 'react';

export interface AntiCheatViolation {
    type: 'tab_switch' | 'fullscreen_exit' | 'copy_attempt' | 'paste_attempt' | 'right_click';
    timestamp: number;
    data?: Record<string, unknown>;
}

export interface UseAntiCheatOptions {
    enabled?: boolean;
    onViolation?: (violation: AntiCheatViolation) => void;
}

export interface UseAntiCheatReturn {
    isFullscreen: boolean;
    violations: AntiCheatViolation[];
    tabSwitchCount: number;
    enterFullscreen: () => Promise<boolean>;
    exitFullscreen: () => Promise<void>;
    clearViolations: () => void;
}

export function useAntiCheat(options: UseAntiCheatOptions = {}): UseAntiCheatReturn {
    const { enabled = true, onViolation } = options;

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [violations, setViolations] = useState<AntiCheatViolation[]>([]);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);

    // Add violation helper
    const addViolation = useCallback((type: AntiCheatViolation['type'], data?: Record<string, unknown>) => {
        const violation: AntiCheatViolation = {
            type,
            timestamp: Date.now(),
            data,
        };
        setViolations(prev => [...prev, violation]);
        onViolation?.(violation);

        if (type === 'tab_switch') {
            setTabSwitchCount(prev => prev + 1);
        }
    }, [onViolation]);

    // Enter fullscreen
    const enterFullscreen = useCallback(async (): Promise<boolean> => {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if ((elem as any).webkitRequestFullscreen) {
                await (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).msRequestFullscreen) {
                await (elem as any).msRequestFullscreen();
            }
            return true;
        } catch (error) {
            console.error('Failed to enter fullscreen:', error);
            return false;
        }
    }, []);

    // Exit fullscreen
    const exitFullscreen = useCallback(async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            }
        } catch (error) {
            console.error('Failed to exit fullscreen:', error);
        }
    }, []);

    // Clear violations
    const clearViolations = useCallback(() => {
        setViolations([]);
        setTabSwitchCount(0);
    }, []);

    // Fullscreen change listener
    useEffect(() => {
        if (!enabled) return;

        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;

            // If was fullscreen and now exited, record violation
            if (isFullscreen && !isNowFullscreen) {
                addViolation('fullscreen_exit');
            }

            setIsFullscreen(isNowFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, [enabled, isFullscreen, addViolation]);

    // Tab/window visibility listener
    useEffect(() => {
        if (!enabled) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                addViolation('tab_switch', { hidden: true });
            }
        };

        const handleBlur = () => {
            addViolation('tab_switch', { type: 'blur' });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [enabled, addViolation]);

    // Copy/paste prevention
    useEffect(() => {
        if (!enabled) return;

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation('copy_attempt');
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation('paste_attempt');
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            addViolation('right_click');
        };

        // Prevent keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+C, Ctrl+V, Ctrl+A, F12, etc.
            if (
                (e.ctrlKey && ['c', 'v', 'a', 'u', 'p'].includes(e.key.toLowerCase())) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
            ) {
                e.preventDefault();
                addViolation('copy_attempt', { key: e.key });
            }
        };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled, addViolation]);

    return {
        isFullscreen,
        violations,
        tabSwitchCount,
        enterFullscreen,
        exitFullscreen,
        clearViolations,
    };
}
