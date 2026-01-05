import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    LogOut,
    User,
    History,
    Settings,
    Trophy,
    LayoutDashboard,
    Shield,
    GraduationCap,
} from "lucide-react";

interface UserProfile {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    level: number | null;
    points: number | null;
}

interface UserMenuProps {
    user: { email?: string } | null;
    profile: UserProfile | null;
    displayName: string;
    isAdmin: boolean;
    isTeacher: boolean;
    onSignOut: () => void;
}

export const UserMenu = ({
    user,
    profile,
    displayName,
    isAdmin,
    isTeacher,
    onSignOut,
}: UserMenuProps) => {
    if (!user) {
        return (
            <>
                <Link to="/auth">
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                        Đăng nhập
                    </Button>
                </Link>
                <Link to="/auth">
                    <Button className="shadow-button">
                        Đăng ký
                    </Button>
                </Link>
            </>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-24 truncate">{displayName}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{displayName}</p>
                        {profile?.username && (
                            <p className="text-xs text-muted-foreground">@{profile.username}</p>
                        )}
                        {profile?.level && (
                            <Badge variant="secondary" className="w-fit mt-1">
                                <Trophy className="w-3 h-3 mr-1" />
                                Level {profile.level} • {profile.points?.toLocaleString() || 0} điểm
                            </Badge>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>
                {profile?.username && (
                    <DropdownMenuItem asChild>
                        <Link to={`/@${profile.username}`}>
                            <User className="w-4 h-4 mr-2" />
                            Xem hồ sơ
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link to="/achievements">
                        <Trophy className="w-4 h-4 mr-2" />
                        Thành tựu
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/history">
                        <History className="w-4 h-4 mr-2" />
                        Lịch sử làm bài
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Thiết lập
                    </Link>
                </DropdownMenuItem>
                {(isAdmin || isTeacher) && (
                    <>
                        <DropdownMenuSeparator />
                        {isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link to="/admin">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Admin Dashboard
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {isTeacher && !isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link to="/teacher">
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    Teacher Dashboard
                                </Link>
                            </DropdownMenuItem>
                        )}
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
