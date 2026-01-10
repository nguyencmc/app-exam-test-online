import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/modules/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Send,
    MessageCircle,
    Smile,
    Image as ImageIcon,
    MoreVertical,
    Pin,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    user_id: string;
    message: string;
    message_type: string;
    metadata: Record<string, any>;
    is_pinned: boolean;
    created_at: string;
    user?: {
        username: string;
        avatar_url: string | null;
    };
}

interface StudyGroupChatProps {
    groupId: string;
    className?: string;
}

export const StudyGroupChat = ({ groupId, className }: StudyGroupChatProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('study_group_messages')
                .select(`
          *,
          user:profiles!study_group_messages_user_id_fkey(username, avatar_url)
        `)
                .eq('group_id', groupId)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // Subscribe to realtime messages
    useEffect(() => {
        fetchMessages();

        const channel = supabase
            .channel(`group-${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'study_group_messages',
                    filter: `group_id=eq.${groupId}`,
                },
                async (payload) => {
                    // Fetch user info for new message
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('user_id', payload.new.user_id)
                        .single();

                    const newMsg: Message = {
                        ...payload.new as Message,
                        user: userData || { username: 'User', avatar_url: null },
                    };

                    setMessages(prev => [...prev, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId, fetchMessages]);

    // Auto scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !user || sending) return;

        setSending(true);
        const messageText = newMessage.trim();
        setNewMessage('');

        try {
            const { error } = await supabase.from('study_group_messages').insert({
                group_id: groupId,
                user_id: user.id,
                message: messageText,
                message_type: 'text',
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(messageText); // Restore message on error
            toast({
                title: 'Lỗi',
                description: 'Không thể gửi tin nhắn',
                variant: 'destructive',
            });
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hôm nay';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        } else {
            return date.toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'long',
            });
        }
    };

    // Group messages by date
    const groupedMessages: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach(msg => {
        const msgDate = new Date(msg.created_at).toDateString();
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groupedMessages.push({ date: msg.created_at, messages: [msg] });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    if (!user) {
        return (
            <Card className={cn("border-border/50", className)}>
                <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Đăng nhập để chat</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("border-border/50 flex flex-col", className)}>
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Nhóm chat
                    <div className="ml-auto flex items-center gap-1 text-sm font-normal text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Online</span>
                    </div>
                </CardTitle>
            </CardHeader>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Chưa có tin nhắn nào</p>
                        <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groupedMessages.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                {/* Date Separator */}
                                <div className="flex items-center gap-2 my-4">
                                    <div className="flex-1 h-px bg-border"></div>
                                    <span className="text-xs text-muted-foreground px-2">
                                        {formatDate(group.date)}
                                    </span>
                                    <div className="flex-1 h-px bg-border"></div>
                                </div>

                                {/* Messages */}
                                {group.messages.map((msg, index) => {
                                    const isOwn = msg.user_id === user.id;
                                    const showAvatar = index === 0 ||
                                        group.messages[index - 1]?.user_id !== msg.user_id;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex gap-2",
                                                isOwn && "flex-row-reverse"
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div className="w-8 flex-shrink-0">
                                                {showAvatar && !isOwn && (
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={msg.user?.avatar_url || undefined} />
                                                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                                                            {msg.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>

                                            {/* Message Bubble */}
                                            <div className={cn(
                                                "max-w-[70%] space-y-1",
                                                isOwn && "items-end"
                                            )}>
                                                {showAvatar && !isOwn && (
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        {msg.user?.username}
                                                    </span>
                                                )}
                                                <div className={cn(
                                                    "px-3 py-2 rounded-2xl",
                                                    isOwn
                                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                                        : "bg-muted rounded-bl-sm"
                                                )}>
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] text-muted-foreground",
                                                    isOwn ? "text-right mr-1" : "ml-1"
                                                )}>
                                                    {formatTime(msg.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t bg-muted/30">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1"
                        disabled={sending}
                    />
                    <Button
                        size="icon"
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
