# AI-Exam.cloud - Nền Tảng Luyện Thi Trực Tuyến

Ứng dụng học tập và luyện thi trực tuyến thông minh với AI, hỗ trợ flashcards, podcasts, sách điện tử và nhiều tính năng học tập.

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui + TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **CI/CD**: GitHub Actions → SSH Deploy

## 📁 Cấu Trúc Dự Án

```
src/
├── components/         # React components
│   ├── layout/         # Layout: Header, Footer, Navigation
│   ├── ui/             # shadcn/ui components (49 files)
│   ├── admin/          # Admin feature components
│   ├── ai/             # AI-powered components
│   ├── dashboard/      # Dashboard widgets
│   ├── flashcard/      # Flashcard features
│   └── social/         # Social features
├── pages/              # Page components (40 files)
│   └── admin/          # Admin pages (14 files)
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (Auth)
├── services/           # API service layer
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
├── constants/          # App constants
├── integrations/       # External integrations (Supabase)
└── lib/                # Utility libraries
```

## 🚀 Bắt Đầu

### Yêu Cầu

- Node.js >= 20
- npm hoặc pnpm

### Cài Đặt

```bash
# Clone repository
git clone https://github.com/nguyencmc/app-exam-test-online.git
cd app-exam-test-online

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Environment Variables

Tạo file `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📜 Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run build:dev` | Build development |
| `npm run lint` | Kiểm tra linting |
| `npm run preview` | Preview production build |

## 👥 Vai Trò Người Dùng

- **Admin**: Toàn quyền quản lý hệ thống
- **Teacher**: Tạo và quản lý bài thi, khóa học
- **Moderator**: Kiểm duyệt nội dung
- **User**: Người dùng học tập

## 🔗 Links

- [Production](https://ai-exam.cloud)
- [Supabase Dashboard](https://supabase.com)

---

Deployed via GitHub Actions CI/CD
