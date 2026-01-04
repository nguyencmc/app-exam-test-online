import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import heroLaptop from "@/assets/hero-laptop.png";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-8 pb-32 lg:pt-16 lg:pb-48">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl animate-slide-up">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Chào mừng đến với AI-Exam.cloud
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-gradient">Luyện thi</span>
              <br />
              <span className="text-foreground">Thông minh với</span>
              <br />
              <span className="text-foreground">AI!</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              AI-Exam.cloud – Nền tảng luyện thi trực tuyến thông minh! Cung cấp đề thi đa dạng, flashcard tương tác, podcast học tập và nhiều công cụ học tập hiệu quả với sự hỗ trợ của AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="shadow-button gap-2 text-base">
                <Sparkles className="h-5 w-5" />
                Bắt đầu ngay
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base">
                <Play className="h-5 w-5" />
                Xem video
              </Button>
            </div>
          </div>

          {/* Right Content - Laptop Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative z-10 animate-float">
              <img
                src={heroLaptop}
                alt="The Best Study Platform"
                className="w-full max-w-2xl mx-auto drop-shadow-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80C240 160 480 200 720 180C960 160 1200 80 1440 100V200H0V80Z"
            fill="hsl(var(--primary))"
          />
        </svg>
      </div>
    </section>
  );
};
