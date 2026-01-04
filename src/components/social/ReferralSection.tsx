import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Gift,
    Copy,
    Check,
    Users,
    Star,
    Link2,
    Share2,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferralStats {
    referralCode: string;
    totalReferrals: number;
    pointsEarned: number;
    referredUsers: Array<{
        id: string;
        username: string;
        avatar_url: string | null;
        created_at: string;
    }>;
}

export const ReferralSection = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState<ReferralStats>({
        referralCode: '',
        totalReferrals: 0,
        pointsEarned: 0,
        referredUsers: [],
    });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user) {
            fetchReferralStats();
        }
    }, [user]);

    const fetchReferralStats = async () => {
        setLoading(true);

        try {
            // Get user's referral code
            const { data: profile } = await supabase
                .from('profiles')
                .select('referral_code, referral_points')
                .eq('user_id', user?.id)
                .single();

            // Get referrals
            const { data: referrals } = await supabase
                .from('referrals')
                .select('*, referred:profiles!referrals_referred_id_fkey(user_id, username, avatar_url, created_at)')
                .eq('referrer_id', user?.id)
                .eq('status', 'completed');

            setStats({
                referralCode: profile?.referral_code || '',
                totalReferrals: referrals?.length || 0,
                pointsEarned: profile?.referral_points || 0,
                referredUsers: referrals?.map(r => ({
                    id: r.referred?.user_id,
                    username: r.referred?.username || 'User',
                    avatar_url: r.referred?.avatar_url,
                    created_at: r.referred?.created_at,
                })) || [],
            });
        } catch (error) {
            console.error('Error fetching referral stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = async () => {
        const link = `${window.location.origin}/auth?ref=${stats.referralCode}`;

        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast({
                title: 'Đã sao chép! 🎉',
                description: 'Link giới thiệu đã được sao chép',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareReferral = () => {
        const link = `${window.location.origin}/auth?ref=${stats.referralCode}`;
        const text = `🎓 Học tập hiệu quả với AI-Exam.cloud! Dùng mã giới thiệu của tôi: ${stats.referralCode}`;

        if (navigator.share) {
            navigator.share({
                title: 'Giới thiệu AI-Exam.cloud',
                text,
                url: link,
            });
        } else {
            copyReferralLink();
        }
    };

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-20 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Giới thiệu bạn bè</h3>
                        <p className="text-sm text-white/80">Nhận 100 điểm cho mỗi người đăng ký</p>
                    </div>
                </div>
            </div>

            <CardContent className="p-4 space-y-4">
                {/* Referral Code */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Mã giới thiệu của bạn</label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                value={stats.referralCode}
                                readOnly
                                className="font-mono text-lg text-center tracking-wider pr-10"
                            />
                            <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyReferralLink}
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Share Button */}
                <Button
                    className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={shareReferral}
                >
                    <Share2 className="w-4 h-4" />
                    Chia sẻ ngay
                </Button>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-500">
                            <Users className="w-5 h-5" />
                            {stats.totalReferrals}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Người đã giới thiệu</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
                            <Star className="w-5 h-5" />
                            {stats.pointsEarned}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Điểm đã nhận</p>
                    </div>
                </div>

                {/* Referred Users */}
                {stats.referredUsers.length > 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-3">Người bạn đã giới thiệu</p>
                        <div className="space-y-2">
                            {stats.referredUsers.slice(0, 5).map((referred) => (
                                <div
                                    key={referred.id}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                                >
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={referred.avatar_url || undefined} />
                                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                            {referred.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{referred.username}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        +100 điểm
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {stats.referredUsers.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Chưa có ai đăng ký qua link của bạn</p>
                        <p className="text-xs mt-1">Chia sẻ mã giới thiệu để nhận điểm thưởng!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
