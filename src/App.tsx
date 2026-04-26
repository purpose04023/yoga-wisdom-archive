import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import BooksPage from "./pages/BooksPage";
import OldBooksPage from "./pages/OldBooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import VideosPage from "./pages/VideosPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import JournalsPage from "./pages/JournalsPage";
import JournalDetailPage from "./pages/JournalDetailPage";
import TranslationsPage from "./pages/TranslationsPage";
import PodcastsPage from "./pages/PodcastsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PortalDashboard from "./pages/portal/PortalDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const App = () => {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary px-6">
        <div className="max-w-2xl rounded-3xl border border-border/80 bg-card/90 p-10 shadow-xl">
          <h1 className="text-3xl font-semibold mb-4">Supabase environment not configured</h1>
          <p className="mb-4 text-muted-foreground">
            The app cannot start because the required Supabase environment variables are missing.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li><code>VITE_SUPABASE_URL</code></li>
            <li><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Add these variables to your local `.env` file or your Vercel project settings, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/old-books" element={<OldBooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/videos/:id" element={<VideoDetailPage />} />
            <Route path="/journals" element={<JournalsPage />} />
            <Route path="/journals/:id" element={<JournalDetailPage />} />
            <Route path="/translations" element={<TranslationsPage />} />
            <Route path="/podcasts" element={<PodcastsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/portal" element={<PortalDashboard />} />
            <Route path="/admin" element={<Navigate to="/portal" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
