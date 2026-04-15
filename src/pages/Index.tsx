import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ContentCard from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Headphones, FileText, Languages, ScrollText } from "lucide-react";

const categories = [
  { label: "Books", path: "/books", icon: BookOpen, desc: "Modern yoga texts" },
  { label: "Old Books", path: "/old-books", icon: ScrollText, desc: "Ancient archives" },
  { label: "Videos", path: "/videos", icon: Video, desc: "Teachings & talks" },
  { label: "Journals", path: "/journals", icon: FileText, desc: "Articles & insights" },
  { label: "Translations", path: "/translations", icon: Languages, desc: "Multi-language texts" },
  { label: "Podcasts", path: "/podcasts", icon: Headphones, desc: "Audio teachings" },
];

const Index = () => {
  const { data: featuredBooks = [] } = useQuery({
    queryKey: ["featured-books"],
    queryFn: async () => {
      const { data } = await supabase.from("books").select("*").eq("is_featured", true).limit(4);
      return data || [];
    },
  });

  const { data: featuredVideos = [] } = useQuery({
    queryKey: ["featured-videos"],
    queryFn: async () => {
      const { data } = await supabase.from("videos").select("*").eq("is_featured", true).limit(4);
      return data || [];
    },
  });

  const { data: latestJournals = [] } = useQuery({
    queryKey: ["latest-journals"],
    queryFn: async () => {
      const { data } = await supabase.from("journals").select("*").order("created_at", { ascending: false }).limit(3);
      return data || [];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 px-4 text-center bg-gradient-to-b from-gold-light/30 to-background">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-4 animate-fade-in">Ancient Wisdom, Modern Access</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Yoga Wisdom Portal
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A curated archive of yoga books, ancient texts, translations, video teachings, podcasts, and scholarly journals.
          </p>
          <div className="flex gap-3 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button asChild size="lg"><Link to="/books">Explore Library</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/about">About Guruji</Link></Button>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-2xl font-bold mb-8 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.path} to={cat.path} className="group flex flex-col items-center p-6 rounded-xl bg-card border hover:border-primary/30 hover:shadow-md transition-all text-center">
              <cat.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">{cat.label}</span>
              <span className="text-xs text-muted-foreground mt-1">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">Featured Books</h2>
            <Link to="/books" className="text-sm text-primary hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <ContentCard key={book.id} title={book.title} description={book.description} imageUrl={book.cover_url} link={`/books/${book.id}`} meta={book.author || undefined} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">Featured Videos</h2>
            <Link to="/videos" className="text-sm text-primary hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVideos.map((v) => (
              <ContentCard key={v.id} title={v.title} description={v.description} imageUrl={v.thumbnail_url} link={`/videos/${v.id}`} meta={v.speaker || undefined} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Journals */}
      {latestJournals.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">Latest Journals</h2>
            <Link to="/journals" className="text-sm text-primary hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestJournals.map((j) => (
              <ContentCard key={j.id} title={j.title} description={j.excerpt} imageUrl={j.featured_image_url} link={`/journals/${j.id}`} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state if no featured content */}
      {featuredBooks.length === 0 && featuredVideos.length === 0 && latestJournals.length === 0 && (
        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">Content is being curated. Use the Admin Portal to add books, videos, and more.</p>
          <Button asChild className="mt-4" variant="outline"><Link to="/admin">Go to Admin</Link></Button>
        </section>
      )}
    </Layout>
  );
};

export default Index;
