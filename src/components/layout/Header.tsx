import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, FileText, Layers, Headphones, GraduationCap, BookMarked, Users, Trophy, Search } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { useUserRole } from "@/modules/auth";
import { supabase } from "@/integrations/supabase/client";
import { GlobalSearch } from "@/components/GlobalSearch";
import { UserMenu } from "./header/UserMenu";
import { MobileNav } from "./header/MobileNav";

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

            {/* Auth Buttons (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <UserMenu
                user={user}
                profile={profile}
                displayName={displayName}
                isAdmin={isAdmin}
                isTeacher={isTeacher}
                onSignOut={handleSignOut}
              />
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

      {/* Mobile Menu */}
      <MobileNav
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        profile={profile}
        displayName={displayName}
        isAdmin={isAdmin}
        isTeacher={isTeacher}
        navLinks={navLinks}
        onSignOut={handleSignOut}
      />
    </>
  );
};
