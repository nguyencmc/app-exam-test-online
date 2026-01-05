import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    X,
    LogOut,
    User,
    History,
    Settings,
    Trophy,
    LayoutDashboard,
    Shield,
    GraduationCap,
    ChevronRight,
    Sparkles,
    LucideIcon,
} from "lucide-react";

interface NavLink {
    name: string;
    href: string;
    icon: LucideIcon;
    description: string;
}

interface UserProfile {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    level: number | null;
    points: number | null;
}

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    user: { email?: string } | null;
    profile: UserProfile | null;
    displayName: string;
    isAdmin: boolean;
    isTeacher: boolean;
    navLinks: NavLink[];
    onSignOut: () => void;
}

export const MobileNav = ({
    isOpen,
    onClose,
    user,
    profile,
    displayName,
    isAdmin,
    isTeacher,
    navLinks,
    onSignOut,
}: MobileNavProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in"
                onClick={onClose}
            />

            {/* Slide Panel */}
            <div className="lg:hidden fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-[70] shadow-2xl animate-slide-in-right">
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="text-lg font-semibold">Menu</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5 text-foreground" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="h-[calc(100%-65px)] overflow-y-auto custom-scrollbar">
                    <nav className="p-4 flex flex-col gap-1">
                        {/* User Info Section (if logged in) */}
                        {user && (
                            <div className="mb-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                                    <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                                        <AvatarImage src={profile?.avatar_url || undefined} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                            {displayName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-semibold truncate">{displayName}</span>
                                        {profile?.username && (
                                            <span className="text-xs text-muted-foreground">@{profile.username}</span>
                                        )}
                                        {profile?.level && (
                                            <Badge variant="secondary" className="w-fit text-xs mt-1">
                                                <Trophy className="w-3 h-3 mr-1" />
                                                Lv.{profile.level} • {profile.points?.toLocaleString() || 0}đ
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Section */}
                        <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2 block">
                                Khám phá
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group border border-border/30 hover:border-primary/30"
                                    onClick={onClose}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <link.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-sm font-medium">{link.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{link.description}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Account Section */}
                        {user && (
                            <>
                                <div className="my-4 border-t border-border/50" />
                                <div className="mb-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2 block">
                                        Tài khoản
                                    </span>
                                </div>

                                <MobileNavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" description="Tổng quan học tập" onClose={onClose} />

                                {profile?.username && (
                                    <MobileNavLink to={`/@${profile.username}`} icon={User} label="Hồ sơ của tôi" description="Xem và chỉnh sửa hồ sơ" onClose={onClose} />
                                )}

                                <MobileNavLink to="/achievements" icon={Trophy} label="Thành tựu" description="Xem thành tựu đạt được" onClose={onClose} />
                                <MobileNavLink to="/history" icon={History} label="Lịch sử làm bài" description="Xem lại các bài đã làm" onClose={onClose} />
                                <MobileNavLink to="/settings" icon={Settings} label="Thiết lập" description="Cài đặt tài khoản" onClose={onClose} />

                                {/* Admin/Teacher Section */}
                                {(isAdmin || isTeacher) && (
                                    <>
                                        <div className="my-4 border-t border-border/50" />
                                        <div className="mb-2">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2 block">
                                                Quản lý
                                            </span>
                                        </div>

                                        {isAdmin && (
                                            <MobileNavLink
                                                to="/admin"
                                                icon={Shield}
                                                label="Admin Dashboard"
                                                description="Quản trị hệ thống"
                                                onClose={onClose}
                                                variant="admin"
                                            />
                                        )}

                                        {isTeacher && !isAdmin && (
                                            <MobileNavLink
                                                to="/teacher"
                                                icon={GraduationCap}
                                                label="Teacher Dashboard"
                                                description="Quản lý giảng dạy"
                                                onClose={onClose}
                                                variant="teacher"
                                            />
                                        )}
                                    </>
                                )}

                                {/* Logout Button */}
                                <div className="my-4 border-t border-border/50" />
                                <button
                                    onClick={() => { onSignOut(); onClose(); }}
                                    className="flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 w-full group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium">Đăng xuất</span>
                                </button>
                            </>
                        )}

                        {/* Auth Buttons for Non-logged in users */}
                        {!user && (
                            <div className="mt-4 flex flex-col gap-3 px-2">
                                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-2">
                                    <p className="text-sm text-center text-muted-foreground">
                                        Đăng nhập để lưu tiến trình học tập và nhận nhiều ưu đãi hơn!
                                    </p>
                                </div>
                                <Link to="/auth" onClick={onClose} className="w-full">
                                    <Button variant="outline" className="w-full justify-center h-12 text-base font-medium">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link to="/auth" onClick={onClose} className="w-full">
                                    <Button className="w-full justify-center h-12 text-base font-medium shadow-button bg-gradient-to-r from-primary to-accent hover:opacity-90">
                                        Đăng ký miễn phí
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
};

// Helper component for mobile nav links
interface MobileNavLinkProps {
    to: string;
    icon: LucideIcon;
    label: string;
    description: string;
    onClose: () => void;
    variant?: 'default' | 'admin' | 'teacher';
}

const MobileNavLink = ({ to, icon: Icon, label, description, onClose, variant = 'default' }: MobileNavLinkProps) => {
    const variantStyles = {
        default: 'hover:bg-primary/10 hover:text-primary',
        admin: 'hover:bg-red-500/10 hover:text-red-500',
        teacher: 'hover:bg-amber-500/10 hover:text-amber-600',
    };

    const iconBgStyles = {
        default: 'bg-muted/50 group-hover:bg-primary/20',
        admin: 'bg-red-500/10 group-hover:bg-red-500/20',
        teacher: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    };

    const iconColorStyles = {
        default: 'text-muted-foreground group-hover:text-primary',
        admin: 'text-red-500',
        teacher: 'text-amber-500',
    };

    return (
        <Link
            to={to}
            onClick={onClose}
            className={`flex items-center gap-3 p-3 rounded-xl text-foreground ${variantStyles[variant]} transition-all duration-200 group`}
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${iconBgStyles[variant]}`}>
                <Icon className={`w-5 h-5 transition-colors ${iconColorStyles[variant]}`} />
            </div>
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all ${variant === 'admin' ? 'group-hover:text-red-500' : variant === 'teacher' ? 'group-hover:text-amber-500' : 'group-hover:text-primary'}`} />
        </Link>
    );
};
