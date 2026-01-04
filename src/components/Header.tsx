import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, History, Settings, BookOpen, Trophy, LayoutDashboard, Shield, GraduationCap, FileText, Layers, Headphones, GraduationCap as Course, BookMarked, Users, ChevronRight, Sparkles, Search } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "@/components/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Luyện thi", href: "/exams", icon: FileText, description: "Luyện đề thi thử" },
  { name: "Flashcards", href: "/flashcards", icon: Layers, description: "Học từ vựng" },
  { name: "Podcasts", href: "/podcasts", icon: Headphones, description: "Nghe podcast" },
  { name: "Khóa học", href: "/courses", icon: GraduationCap, description: "Khóa học online" },
  { name: "Sách", href: "/books", icon: BookMarked, description: "Thư viện sách" },
  { name: "Nhóm học tập", href: "/study-groups", icon: Users, description: "Học nhóm" },
  { name: "Bảng xếp hạng", href: "/leaderboard", icon: Trophy, description: "Xếp hạng" },
];

interface UserProfile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  level: number | null;
  points: number | null;
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, isTeacher } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, level, points')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="AI-Exam.cloud" className="h-10 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Exam.cloud
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Search Button */}
            <Button
              variant="outline"
              className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground px-3"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Tìm kiếm</span>
              <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Global Search Dialog */}
            <GlobalSearch />

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
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
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
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
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - outside header to avoid stacking context issues */}
      {isMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
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
                onClick={() => setIsMenuOpen(false)}
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
                      onClick={() => setIsMenuOpen(false)}
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

                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">Dashboard</span>
                        <span className="text-xs text-muted-foreground">Tổng quan học tập</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>

                    {profile?.username && (
                      <Link
                        to={`/@${profile.username}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-medium">Hồ sơ của tôi</span>
                          <span className="text-xs text-muted-foreground">Xem và chỉnh sửa hồ sơ</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    )}

                    <Link
                      to="/achievements"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Trophy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">Thành tựu</span>
                        <span className="text-xs text-muted-foreground">Xem thành tựu đạt được</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <History className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">Lịch sử làm bài</span>
                        <span className="text-xs text-muted-foreground">Xem lại các bài đã làm</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">Thiết lập</span>
                        <span className="text-xs text-muted-foreground">Cài đặt tài khoản</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>

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
                          <Link
                            to="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                              <Shield className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex flex-col flex-1">
                              <span className="text-sm font-medium">Admin Dashboard</span>
                              <span className="text-xs text-muted-foreground">Quản trị hệ thống</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                          </Link>
                        )}

                        {isTeacher && !isAdmin && (
                          <Link
                            to="/teacher"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-amber-500/10 hover:text-amber-600 transition-all duration-200 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                              <GraduationCap className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex flex-col flex-1">
                              <span className="text-sm font-medium">Teacher Dashboard</span>
                              <span className="text-xs text-muted-foreground">Quản lý giảng dạy</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                          </Link>
                        )}
                      </>
                    )}

                    {/* Logout Button */}
                    <div className="my-4 border-t border-border/50" />
                    <button
                      onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
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
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full">
                      <Button variant="outline" className="w-full justify-center h-12 text-base font-medium">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full">
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
      )}
    </>
  );
};
