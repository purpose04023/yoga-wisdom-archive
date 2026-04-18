import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const App = () => (
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
