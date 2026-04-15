import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ContentFilters from "@/components/ContentFilters";
import { useContentFilters } from "@/hooks/useContentFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

const PodcastsPage = () => {
  const filters = useContentFilters();
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: podcasts = [], isLoading } = useQuery({
    queryKey: ["podcasts", filters.searchQuery, filters.selectedTopic, filters.selectedLanguage],
    queryFn: async () => {
      let q = supabase.from("podcasts").select("*, topics(name), languages(name)").order("created_at", { ascending: false });
      if (filters.selectedTopic !== "all") q = q.eq("topic_id", filters.selectedTopic);
      if (filters.selectedLanguage !== "all") q = q.eq("language_id", filters.selectedLanguage);
      if (filters.searchQuery) q = q.ilike("title", `%${filters.searchQuery}%`);
      const { data } = await q;
      return data || [];
    },
  });

  const togglePlay = (id: string, url: string | null) => {
    if (!url) return;
    if (playing === id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setPlaying(null);
      audioRef.current = audio;
      setPlaying(id);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Podcasts</h1>
        <p className="text-muted-foreground mb-8">Listen to teachings, discussions, and guided meditations.</p>
        <ContentFilters searchQuery={filters.searchQuery} onSearchChange={filters.setSearchQuery} topics={filters.topics} selectedTopic={filters.selectedTopic} onTopicChange={filters.setSelectedTopic} languages={filters.languages} selectedLanguage={filters.selectedLanguage} onLanguageChange={filters.setSelectedLanguage} />
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : podcasts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No podcasts found. Check back soon!</p>
        ) : (
          <div className="space-y-4">
            {podcasts.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <button onClick={() => togglePlay(p.id, p.audio_url)} className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors" disabled={!p.audio_url}>
                    {playing === p.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold truncate">{p.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{p.description}</p>
                    <div className="flex gap-2 mt-1">
                      {(p.topics as any)?.name && <Badge variant="secondary" className="text-xs">{(p.topics as any).name}</Badge>}
                      {p.duration && <span className="text-xs text-muted-foreground">{p.duration}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PodcastsPage;
