import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ContentCard from "@/components/ContentCard";
import ContentFilters from "@/components/ContentFilters";
import { useContentFilters } from "@/hooks/useContentFilters";

const JournalsPage = () => {
  const filters = useContentFilters();

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ["journals", filters.searchQuery, filters.selectedTopic, filters.selectedLanguage],
    queryFn: async () => {
      let q = supabase.from("journals").select("*, topics(name), languages(name)").order("created_at", { ascending: false });
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
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Journals & Blog</h1>
        <p className="text-muted-foreground mb-8">Read articles, research, and insights on yoga philosophy and practice.</p>
        <ContentFilters searchQuery={filters.searchQuery} onSearchChange={filters.setSearchQuery} topics={filters.topics} selectedTopic={filters.selectedTopic} onTopicChange={filters.setSelectedTopic} languages={filters.languages} selectedLanguage={filters.selectedLanguage} onLanguageChange={filters.setSelectedLanguage} />
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : journals.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No journals found. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {journals.map((j) => (
              <ContentCard key={j.id} title={j.title} description={j.excerpt} imageUrl={j.featured_image_url} link={`/journals/${j.id}`} badge={(j.topics as any)?.name} meta={new Date(j.created_at).toLocaleDateString()} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JournalsPage;
