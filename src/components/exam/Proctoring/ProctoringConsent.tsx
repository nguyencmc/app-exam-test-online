// Proctoring Consent Modal
// Shows consent dialog before enabling proctoring

import { useState } from 'react';
import { Camera, Shield, MonitorSmartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface ProctoringConsentProps {
    open: boolean;
    onAccept: (options: ProctoringOptions) => void;
    onDecline: () => void;
    examTitle?: string;
}

export interface ProctoringOptions {
    enableCamera: boolean;
    enableAntiCheat: boolean;
    enableFullscreen: boolean;
}

export function ProctoringConsent({
    open,
    onAccept,
    onDecline,
    examTitle = 'Bài thi',
}: ProctoringConsentProps) {
    const [enableCamera, setEnableCamera] = useState(true);
    const [enableAntiCheat, setEnableAntiCheat] = useState(true);
    const [enableFullscreen, setEnableFullscreen] = useState(true);
    const [agreed, setAgreed] = useState(false);

    const handleAccept = () => {
        onAccept({
            enableCamera,
            enableAntiCheat,
            enableFullscreen,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onDecline()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Chế độ giám sát thi
                    </DialogTitle>
                    <DialogDescription>
                        {examTitle} yêu cầu bật chế độ giám sát để đảm bảo tính trung thực.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Camera option */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Checkbox
                            id="camera"
                            checked={enableCamera}
                            onCheckedChange={(checked) => setEnableCamera(!!checked)}
                        />
                        <div className="flex-1">
                            <label htmlFor="camera" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Camera className="w-4 h-4 text-primary" />
                                Bật camera giám sát
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Chụp ảnh định kỳ trong quá trình thi
                            </p>
                        </div>
                    </div>

                    {/* Anti-cheat option */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Checkbox
                            id="anticheat"
                            checked={enableAntiCheat}
                            onCheckedChange={(checked) => setEnableAntiCheat(!!checked)}
                        />
                        <div className="flex-1">
                            <label htmlFor="anticheat" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Shield className="w-4 h-4 text-primary" />
                                Chống gian lận
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Phát hiện chuyển tab, copy/paste
                            </p>
                        </div>
                    </div>

                    {/* Fullscreen option */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Checkbox
                            id="fullscreen"
                            checked={enableFullscreen}
                            onCheckedChange={(checked) => setEnableFullscreen(!!checked)}
                        />
                        <div className="flex-1">
                            <label htmlFor="fullscreen" className="flex items-center gap-2 font-medium cursor-pointer">
                                <MonitorSmartphone className="w-4 h-4 text-primary" />
                                Chế độ toàn màn hình
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Bắt buộc làm bài ở chế độ fullscreen
                            </p>
                        </div>
                    </div>

                    {/* Agreement checkbox */}
                    <div className="flex items-start gap-3 pt-2 border-t">
                        <Checkbox
                            id="agree"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(!!checked)}
                        />
                        <label htmlFor="agree" className="text-sm cursor-pointer">
                            Tôi đồng ý cho phép hệ thống giám sát trong quá trình thi và hiểu rằng dữ liệu sẽ được lưu trữ để xác minh.
                        </label>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onDecline}>
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleAccept} disabled={!agreed}>
                        <Check className="w-4 h-4 mr-2" />
                        Đồng ý & Bắt đầu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ProctoringConsent;
