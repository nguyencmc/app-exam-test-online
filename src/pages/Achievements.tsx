import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AchievementsBadgeDisplay } from '@/components/achievements/AchievementsBadgeDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

const Achievements = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Thành tựu
            </h1>
            <p className="text-muted-foreground mt-1">
              Theo dõi tiến độ và thu thập huy hiệu
            </p>
          </div>
          {!user && (
            <Link to="/auth">
              <Button>Đăng nhập</Button>
            </Link>
          )}
        </div>

        <AchievementsBadgeDisplay showAll />
      </main>
      
      <Footer />
    </div>
  );
};

export default Achievements;
