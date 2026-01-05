import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/layout";
import { PageLoader } from "@/components/PageLoader";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseLearning = lazy(() => import("./pages/CourseLearning"));
const Exams = lazy(() => import("./pages/Exams"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const SpacedRepetitionReview = lazy(() => import("./pages/SpacedRepetitionReview"));
const Podcasts = lazy(() => import("./pages/Podcasts"));
const PodcastDetail = lazy(() => import("./pages/PodcastDetail"));
const Books = lazy(() => import("./pages/Books"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const BookReader = lazy(() => import("./pages/BookReader"));
const PdfBookReader = lazy(() => import("./pages/PdfBookReader"));
const ExamCategoryDetail = lazy(() => import("./pages/ExamCategoryDetail"));
const ExamDetail = lazy(() => import("./pages/ExamDetail"));
const ExamTaking = lazy(() => import("./pages/ExamTaking"));
const ExamHistory = lazy(() => import("./pages/ExamHistory"));
const AttemptDetail = lazy(() => import("./pages/AttemptDetail"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const StudyGroups = lazy(() => import("./pages/StudyGroups"));
const StudyGroupDetail = lazy(() => import("./pages/StudyGroupDetail"));

// Admin & Teacher pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const TeacherDashboard = lazy(() => import("./pages/admin/TeacherDashboard"));
const ExamManagement = lazy(() => import("./pages/admin/ExamManagement"));
const ExamEditor = lazy(() => import("./pages/admin/ExamEditor"));
const ExamCreatorV2 = lazy(() => import("./pages/admin/ExamCreatorV2"));
const FlashcardManagement = lazy(() => import("./pages/admin/FlashcardManagement"));
const FlashcardEditor = lazy(() => import("./pages/admin/FlashcardEditor"));
const PodcastManagement = lazy(() => import("./pages/admin/PodcastManagement"));
const PodcastEditor = lazy(() => import("./pages/admin/PodcastEditor"));
const CategoryManagement = lazy(() => import("./pages/admin/CategoryManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const CourseManagement = lazy(() => import("./pages/admin/CourseManagement"));
const CourseEditor = lazy(() => import("./pages/admin/CourseEditor"));
const ModuleLessonEditor = lazy(() => import("./pages/admin/ModuleLessonEditor"));
const BookManagement = lazy(() => import("./pages/admin/BookManagement"));
const BookEditor = lazy(() => import("./pages/admin/BookEditor"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Main content with bottom padding for mobile nav */}
          <div className="pb-16 lg:pb-0">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses/:id/learn" element={<CourseLearning />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/flashcards/review" element={<SpacedRepetitionReview />} />
                <Route path="/podcasts" element={<Podcasts />} />
                <Route path="/podcast/:slug" element={<PodcastDetail />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/exams/:slug" element={<ExamCategoryDetail />} />
                <Route path="/books" element={<Books />} />
                <Route path="/book/:slug" element={<BookDetail />} />
                <Route path="/book/:slug/read" element={<BookReader />} />
                <Route path="/book/:slug/pdf" element={<PdfBookReader />} />
                <Route path="/exam/:slug" element={<ExamDetail />} />
                <Route path="/exam/:slug/take" element={<ExamTaking />} />
                <Route path="/history" element={<ExamHistory />} />
                <Route path="/history/:attemptId" element={<AttemptDetail />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/study-groups" element={<StudyGroups />} />
                <Route path="/study-groups/:groupId" element={<StudyGroupDetail />} />
                <Route path="/@:username" element={<UserProfile />} />

                {/* Admin & Teacher routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
                <Route path="/admin/exams" element={<ExamManagement />} />
                <Route path="/admin/exams/create" element={<ExamEditor />} />
                <Route path="/admin/exams/create-v2" element={<ExamCreatorV2 />} />
                <Route path="/admin/exams/v2/:id" element={<ExamCreatorV2 />} />
                <Route path="/admin/exams/:id" element={<ExamEditor />} />
                <Route path="/admin/flashcards" element={<FlashcardManagement />} />
                <Route path="/admin/flashcards/create" element={<FlashcardEditor />} />
                <Route path="/admin/flashcards/:id" element={<FlashcardEditor />} />
                <Route path="/admin/podcasts" element={<PodcastManagement />} />
                <Route path="/admin/podcasts/create" element={<PodcastEditor />} />
                <Route path="/admin/podcasts/:id" element={<PodcastEditor />} />
                <Route path="/admin/courses" element={<CourseManagement />} />
                <Route path="/admin/courses/create" element={<CourseEditor />} />
                <Route path="/admin/courses/:id" element={<CourseEditor />} />
                <Route path="/admin/courses/:id/content" element={<ModuleLessonEditor />} />
                <Route path="/admin/books" element={<BookManagement />} />
                <Route path="/admin/books/create" element={<BookEditor />} />
                <Route path="/admin/books/:id" element={<BookEditor />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>

          {/* Bottom Navigation for Mobile */}
          <BottomNavigation />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
