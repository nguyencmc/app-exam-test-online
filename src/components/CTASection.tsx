import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background Wave */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Hoàn toàn miễn phí</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Tham gia cùng hàng nghìn học viên đang cải thiện kỹ năng mỗi ngày với AI-Exam.cloud.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2 text-base font-semibold"
            >
              Đăng ký miễn phí
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 text-base font-semibold"
            >
              Khám phá tính năng
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
