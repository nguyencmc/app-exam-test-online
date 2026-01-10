import { useState } from 'react';
import { useAuth } from '@/modules/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Share2,
    Copy,
    Check,
    Facebook,
    Twitter,
    Link2,
    Trophy,
    Target,
    Clock,
    MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamResult {
    attemptId: string;
    examTitle: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken?: number;
}

interface ShareResultModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    result: ExamResult;
}

export const ShareResultModal = ({ open, onOpenChange, result }: ShareResultModalProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [loading, setLoading] = useState(false);

    // Generate share link
    const generateShareLink = async () => {
        if (!user) return;

        setLoading(true);

        try {
            // Generate unique share token
            const shareToken = Math.random().toString(36).substring(2, 15);

            // Save to database
            const { error } = await supabase.from('exam_result_shares').insert({
                attempt_id: result.attemptId,
                user_id: user.id,
                share_type: 'public_link',
                share_token: shareToken,
                metadata: {
                    exam_title: result.examTitle,
                    score: result.score,
                },
            });

            if (error) throw error;

            const link = `${window.location.origin}/shared-result/${shareToken}`;
            setShareLink(link);
        } catch (error) {
            console.error('Error generating share link:', error);
            // Fallback to basic share
            setShareLink(`${window.location.origin}/history/${result.attemptId}`);
        } finally {
            setLoading(false);
        }
    };

    // Copy link to clipboard
    const copyLink = async () => {
        if (!shareLink) {
            await generateShareLink();
        }

        const linkToCopy = shareLink || `${window.location.origin}/history/${result.attemptId}`;

        try {
            await navigator.clipboard.writeText(linkToCopy);
            setCopied(true);
            toast({
                title: 'Đã sao chép!',
                description: 'Link kết quả đã được sao chép',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Share to social media
    const shareToSocial = (platform: 'facebook' | 'twitter') => {
        const text = `🎉 Tôi vừa hoàn thành bài thi "${result.examTitle}" với điểm ${result.score}%! Thử sức ngay tại AI-Exam.cloud`;
        const url = shareLink || `${window.location.origin}/history/${result.attemptId}`;

        let shareUrl = '';

        if (platform === 'facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        } else if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreEmoji = (score: number) => {
        if (score >= 90) return '🏆';
        if (score >= 80) return '🌟';
        if (score >= 70) return '💪';
        if (score >= 60) return '👍';
        return '📚';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        Chia sẻ kết quả
                    </DialogTitle>
                    <DialogDescription>
                        Chia sẻ thành tích của bạn với bạn bè
                    </DialogDescription>
                </DialogHeader>

                {/* Result Preview Card */}
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-4xl mb-2">{getScoreEmoji(result.score)}</div>
                            <h3 className="font-bold text-lg mb-1">{result.examTitle}</h3>
                            <div className={cn("text-4xl font-bold mb-2", getScoreColor(result.score))}>
                                {result.score}%
                            </div>
                            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Target className="w-4 h-4" />
                                    {result.correctAnswers}/{result.totalQuestions}
                                </div>
                                {result.timeTaken && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Share Options */}
                <div className="space-y-4">
                    {/* Copy Link */}
                    <div className="flex gap-2">
                        <Input
                            value={shareLink || `${window.location.origin}/history/${result.attemptId}`}
                            readOnly
                            className="text-sm"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyLink}
                            disabled={loading}
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="gap-2 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white border-0"
                            onClick={() => shareToSocial('facebook')}
                        >
                            <Facebook className="w-4 h-4" />
                            Facebook
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 hover:text-white border-0"
                            onClick={() => shareToSocial('twitter')}
                        >
                            <Twitter className="w-4 h-4" />
                            Twitter
                        </Button>
                    </div>

                    {/* Share to Study Group */}
                    <Button variant="outline" className="w-full gap-2" disabled>
                        <MessageCircle className="w-4 h-4" />
                        Chia sẻ vào nhóm học tập
                        <Badge variant="secondary" className="ml-auto text-xs">Sắp ra mắt</Badge>
                    </Button>
                </div>

                {/* Motivation text */}
                <p className="text-center text-xs text-muted-foreground">
                    🚀 Chia sẻ để động viên bạn bè cùng học tập!
                </p>
            </DialogContent>
        </Dialog>
    );
};
