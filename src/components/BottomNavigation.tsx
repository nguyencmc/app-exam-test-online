import { useLocation, Link } from 'react-router-dom';
import { Home, FileText, LayoutDashboard, Trophy, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Luyện thi', href: '/exams', icon: FileText },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Xếp hạng', href: '/leaderboard', icon: Trophy },
];

export const BottomNavigation = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <>
            {/* Bottom Navigation Bar - Only visible on mobile */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                                    active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "relative p-1.5 rounded-xl transition-all duration-200",
                                    active && "bg-primary/10"
                                )}>
                                    <Icon className={cn(
                                        "w-5 h-5 transition-transform",
                                        active && "scale-110"
                                    )} />
                                    {active && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium mt-1 transition-all",
                                    active ? "opacity-100" : "opacity-70"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    {/* More Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={cn(
                            "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                            menuOpen
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "relative p-1.5 rounded-xl transition-all duration-200",
                            menuOpen && "bg-primary/10"
                        )}>
                            <Menu className={cn(
                                "w-5 h-5 transition-transform",
                                menuOpen && "scale-110"
                            )} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium mt-1 transition-all",
                            menuOpen ? "opacity-100" : "opacity-70"
                        )}>
                            Thêm
                        </span>
                    </button>
                </div>
            </nav>

            {/* More Menu Popup */}
            {menuOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="lg:hidden fixed bottom-20 left-4 right-4 z-50 bg-background rounded-2xl border border-border/50 shadow-xl p-4 animate-slide-up">
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { name: 'Flashcards', href: '/flashcards', icon: '🃏' },
                                { name: 'Podcasts', href: '/podcasts', icon: '🎧' },
                                { name: 'Sách', href: '/books', icon: '📚' },
                                { name: 'Khóa học', href: '/courses', icon: '🎓' },
                                { name: 'Nhóm học', href: '/study-groups', icon: '👥' },
                                { name: 'Lịch sử', href: '/history', icon: '📋' },
                                { name: 'Thành tựu', href: '/achievements', icon: '🏆' },
                                { name: 'Cài đặt', href: '/settings', icon: '⚙️' },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="text-xs text-muted-foreground text-center">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
