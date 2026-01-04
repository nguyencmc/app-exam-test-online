import { 
  BookOpen, 
  Gamepad2, 
  PenTool, 
  Puzzle, 
  Target, 
  Zap,
  Grid3X3,
  MessageSquare,
  Brain,
  Trophy,
  Layers,
  Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Thẻ ghi nhớ",
    description: "Ghi nhớ từ vựng hiệu quả với hệ thống thẻ ghi nhớ thông minh, hỗ trợ học sâu và ôn tập theo phương pháp lặp lại ngắt quãng.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Puzzle,
    title: "Ghép thẻ",
    description: "Cải thiện khả năng ghi nhớ từ vựng thông qua trò chơi ghép thẻ – luyện phản xạ nhanh và ghi nhớ sâu sắc hơn.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: PenTool,
    title: "Đoán chữ",
    description: "Bạn có đoán được từ bí mật không? Hãy luyện từ vựng và khả năng suy luận với trò chơi đoán chữ.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Grid3X3,
    title: "Câu đố ô chữ",
    description: "Luyện từ vựng hiệu quả với trò chơi ô chữ – rèn phản xạ từ vựng và kỹ năng đoán từ qua từng gợi ý.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Target,
    title: "Tiêu diệt quái vật",
    description: "Điều khiển nhân vật, vượt qua thử thách và tiêu diệt quái vật để giành lại vốn từ của mình!",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Zap,
    title: "Con rắn chăm chỉ",
    description: "Luyện phản xạ và từ vựng cùng lúc! Điều khiển con rắn thông minh, tìm đúng từ để ghi điểm.",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: Brain,
    title: "Trắc nghiệm",
    description: "Thử thách trí tuệ với trắc nghiệm từ vựng! Bạn có thể trả lời đúng tất cả các câu hỏi không?",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: MessageSquare,
    title: "Điền vào ô trống",
    description: "Điền vào ô trống và tìm ra từ vựng chính xác! Luyện tập từng thuật ngữ qua định nghĩa.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Layers,
    title: "Ghép nối và điền từ",
    description: "Nối từ đúng với định nghĩa để nâng cao vốn từ vựng của bạn một cách nhanh chóng.",
    color: "bg-teal-100 text-teal-600",
  },
  {
    icon: Gamepad2,
    title: "Bảng học từ vựng",
    description: "Sử dụng bảng học từ vựng để lật và che các ô từ. Đoán nghĩa và kiểm tra khả năng ghi nhớ!",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: Trophy,
    title: "Thử tài đoán chữ",
    description: "Thách thức khả năng ghép chữ! Kéo thả các phần của từ vào đúng vị trí.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Lightbulb,
    title: "Ghép từ bí ẩn",
    description: "Trở thành nhà giải đố tài ba! Tìm và ghép các cặp từ bí ẩn để hoàn thành từ vựng.",
    color: "bg-lime-100 text-lime-600",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="relative bg-primary py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            The Best Study mang đến những tính năng tuyệt vời giúp bạn đẩy nhanh hành trình học ngôn ngữ. Đây là những tính năng nổi bật mà bạn chắc chắn sẽ yêu thích!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group bg-card border-0 shadow-card card-hover cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-2">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0 rotate-180">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 40C360 100 720 120 1080 80C1260 60 1380 30 1440 0V120H0V40Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};
