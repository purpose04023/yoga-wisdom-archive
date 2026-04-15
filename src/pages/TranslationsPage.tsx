import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ContentFilters from "@/components/ContentFilters";
import { useContentFilters } from "@/hooks/useContentFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages } from "lucide-react";

const TranslationsPage = () => {
  const filters = useContentFilters();

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ["translations", filters.searchQuery, filters.selectedTopic, filters.selectedLanguage],
    queryFn: async () => {
      let q = supabase.from("translations").select("*, topics(name), source_lang:languages!translations_source_language_id_fkey(name), target_lang:languages!translations_target_language_id_fkey(name)").order("created_at", { ascending: false });
      if (filters.selectedTopic !== "all") q = q.eq("topic_id", filters.selectedTopic);
      if (filters.selectedLanguage !== "all") q = q.or(`source_language_id.eq.${filters.selectedLanguage},target_language_id.eq.${filters.selectedLanguage}`);
      if (filters.searchQuery) q = q.ilike("title", `%${filters.searchQuery}%`);
      const { data } = await q;
      return data || [];
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Translations</h1>
        <p className="text-muted-foreground mb-8">Side-by-side translations of sacred yoga texts.</p>
        <ContentFilters searchQuery={filters.searchQuery} onSearchChange={filters.setSearchQuery} topics={filters.topics} selectedTopic={filters.selectedTopic} onTopicChange={filters.setSelectedTopic} languages={filters.languages} selectedLanguage={filters.selectedLanguage} onLanguageChange={filters.setSelectedLanguage} />
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : translations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No translations found. Check back soon!</p>
        ) : (
          <div className="space-y-6">
            {translations.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-xl font-semibold">{t.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(t.topics as any)?.name && <Badge variant="secondary">{(t.topics as any).name}</Badge>}
                    {(t.source_lang as any)?.name && <Badge variant="outline">{(t.source_lang as any).name} →</Badge>}
                    {(t.target_lang as any)?.name && <Badge variant="outline">{(t.target_lang as any).name}</Badge>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Original</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.source_text}</p>
                    </div>
                    <div className="bg-sage-light/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Translation</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.translated_text}</p>
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

export default TranslationsPage;
