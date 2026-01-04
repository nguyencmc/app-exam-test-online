import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Hải Đinh",
    role: "Học viên",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "Mình rất thích học tiếng Anh trên The Best Study. Các bài học như flashcard, game từ vựng, bài thi thử… rất hữu ích và dễ tiếp cận. Nhờ website mà việc học trở nên thú vị và hiệu quả hơn!",
    rating: 5,
  },
  {
    name: "Trần Thị Bảo Châu",
    role: "Học viên",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    content: "The Best Study quả thực là một website tuyệt vời! Tôi đã học được rất nhiều điều bổ ích và thú vị tại đây. Chúc The Best Study ngày càng phát triển!",
    rating: 5,
  },
  {
    name: "Nguyễn Văn Minh",
    role: "Học viên",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "Giao diện đẹp, dễ sử dụng. Các trò chơi từ vựng rất hay và giúp mình nhớ từ lâu hơn. Đặc biệt là tính năng lặp lại ngắt quãng rất hiệu quả!",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            Phản hồi từ học viên
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Cảm nhận của học viên
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The Best Study luôn lắng nghe và không ngừng cải thiện để mang đến cho bạn trải nghiệm học ngôn ngữ tốt nhất.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="relative bg-card border border-border/50 shadow-card card-hover overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-6 lg:p-8">
                {/* Quote Icon */}
                <Quote className="h-10 w-10 text-primary/20 absolute top-4 right-4" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
