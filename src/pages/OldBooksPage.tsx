import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ContentCard from "@/components/ContentCard";
import ContentFilters from "@/components/ContentFilters";
import { useContentFilters } from "@/hooks/useContentFilters";

const OldBooksPage = () => {
  const filters = useContentFilters();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books", "old", filters.searchQuery, filters.selectedTopic, filters.selectedLanguage],
    queryFn: async () => {
      let q = supabase.from("books").select("*, topics(name), languages(name)").eq("book_type", "old").order("created_at", { ascending: false });
      if (filters.selectedTopic !== "all") q = q.eq("topic_id", filters.selectedTopic);
      if (filters.selectedLanguage !== "all") q = q.eq("language_id", filters.selectedLanguage);
      if (filters.searchQuery) q = q.ilike("title", `%${filters.searchQuery}%`);
      const { data } = await q;
      return data || [];
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">Ancient Archive</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Old Books Collection</h1>
          <p className="text-muted-foreground">Rare and historical yoga manuscripts preserved for future generations.</p>
        </div>
        <ContentFilters searchQuery={filters.searchQuery} onSearchChange={filters.setSearchQuery} topics={filters.topics} selectedTopic={filters.selectedTopic} onTopicChange={filters.setSelectedTopic} languages={filters.languages} selectedLanguage={filters.selectedLanguage} onLanguageChange={filters.setSelectedLanguage} />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : books.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No old books found. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <ContentCard key={book.id} title={book.title} description={book.description} imageUrl={book.cover_url} link={`/books/${book.id}`} meta={book.author || undefined} badge={(book.topics as any)?.name} vintage />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OldBooksPage;
