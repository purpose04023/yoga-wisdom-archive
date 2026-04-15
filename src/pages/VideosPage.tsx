import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ContentCard from "@/components/ContentCard";
import ContentFilters from "@/components/ContentFilters";
import { useContentFilters } from "@/hooks/useContentFilters";

const VideosPage = () => {
  const filters = useContentFilters();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos", filters.searchQuery, filters.selectedTopic, filters.selectedLanguage],
    queryFn: async () => {
      let q = supabase.from("videos").select("*, topics(name), languages(name)").order("created_at", { ascending: false });
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
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Videos</h1>
        <p className="text-muted-foreground mb-8">Watch yoga teachings, lectures, and guided practices.</p>
        <ContentFilters searchQuery={filters.searchQuery} onSearchChange={filters.setSearchQuery} topics={filters.topics} selectedTopic={filters.selectedTopic} onTopicChange={filters.setSelectedTopic} languages={filters.languages} selectedLanguage={filters.selectedLanguage} onLanguageChange={filters.setSelectedLanguage} />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No videos found. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <ContentCard key={v.id} title={v.title} description={v.description} imageUrl={v.thumbnail_url} link={`/videos/${v.id}`} meta={v.speaker || undefined} badge={(v.topics as any)?.name} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VideosPage;
