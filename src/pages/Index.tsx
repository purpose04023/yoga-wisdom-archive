import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ContentCard from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Headphones, FileText, Languages, ScrollText } from "lucide-react";
import shivaHero from "@/assets/shiva-hero.png";

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
      {/* Cinematic Hero with Shiva backdrop */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${shivaHero})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-transparent to-charcoal/40" aria-hidden />

        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <p className="text-xs md:text-sm font-medium tracking-[0.4em] uppercase text-gold mb-6 animate-fade-in">
            ॐ &nbsp; Ancient Wisdom · Modern Access &nbsp; ॐ
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-warm-ivory mb-6 leading-[1.05] animate-fade-in drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]" style={{ animationDelay: "0.1s" }}>
            Yoga <span className="text-gradient-gold italic">Wisdom</span> Portal
          </h1>
          <p className="text-lg md:text-xl text-warm-ivory/85 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A sacred archive of yogic books, ancient śāstras, translations, video teachings, podcasts, and scholarly journals — preserved for seekers across the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button asChild size="lg" className="bg-gradient-gold hover:opacity-90 text-primary-foreground border-0 shadow-gold text-base px-8 h-12">
              <Link to="/books">Enter the Library</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-warm-ivory/10 backdrop-blur-md border-warm-ivory/40 text-warm-ivory hover:bg-warm-ivory/20 hover:text-warm-ivory text-base px-8 h-12">
              <Link to="/about">About Guruji</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-warm-ivory/60 text-xs tracking-[0.3em] uppercase animate-fade-in" style={{ animationDelay: "0.6s" }}>
          ↓ Scroll to explore
        </div>
      </section>

      {/* Category tiles */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">The Archive</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.path}
              to={cat.path}
              className="group flex flex-col items-center p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 text-center animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <cat.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
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
