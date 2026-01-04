import { 
  Facebook, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  features: [
    { name: "Thẻ ghi nhớ", href: "#" },
    { name: "Trò chơi từ vựng", href: "#" },
    { name: "Bài thi thử", href: "#" },
    { name: "Podcasts", href: "#" },
    { name: "Khóa học", href: "#" },
  ],
  support: [
    { name: "Hướng dẫn sử dụng", href: "#" },
    { name: "Câu hỏi thường gặp", href: "#" },
    { name: "Liên hệ hỗ trợ", href: "#" },
    { name: "Báo lỗi", href: "#" },
  ],
  legal: [
    { name: "Điều khoản sử dụng", href: "#" },
    { name: "Chính sách bảo mật", href: "#" },
    { name: "Quyền riêng tư", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "Youtube" },
  { icon: Mail, href: "#", label: "Email" },
];

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background/90">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <img src={logo} alt="AI-Exam.cloud" className="h-10 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Exam.cloud
              </span>
            </div>
            <p className="text-background/70 mb-6 leading-relaxed">
              Nền tảng luyện thi trực tuyến thông minh với AI, giúp việc học trở nên thú vị và hiệu quả hơn.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-bold text-lg mb-6">Tính năng</h3>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6">Hỗ trợ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-background/70">Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-background/70">+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-background/70">support@ai-exam.cloud</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2024 AI-Exam.cloud. Tất cả quyền được bảo lưu.
            </p>
            <p className="text-background/60 text-sm flex items-center gap-1">
              Được tạo với <Heart className="h-4 w-4 text-red-500 fill-red-500" /> tại Việt Nam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
