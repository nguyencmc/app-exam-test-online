import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, Copy, Check } from 'lucide-react';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EmbedDialogProps {
    setId: string;
    title: string;
}

export const EmbedDialog = ({ setId, title }: EmbedDialogProps) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const embedCode = `<iframe src="${window.location.origin}/embed/flashcards/${setId}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        toast({
            title: "Đã sao chép!",
            description: "Mã nhúng đã được lưu vào clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Lấy mã nhúng">
                    <Code className="w-5 h-5 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Nhúng bộ thẻ này</DialogTitle>
                    <DialogDescription>
                        Sao chép mã dưới đây để nhúng bộ flashcard "{title}" vào website hoặc blog của bạn.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Mã Iframe</Label>
                        <div className="relative">
                            <Input
                                value={embedCode}
                                readOnly
                                className="pr-12 font-mono text-xs bg-muted/50"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg overflow-hidden">
                        <p className="text-xs text-muted-foreground mb-2">Xem trước:</p>
                        <div className="border rounded bg-background w-full h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                            [Flashcard Frame Preview]
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
