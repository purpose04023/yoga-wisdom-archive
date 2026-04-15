import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const JournalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: journal, isLoading } = useQuery({
    queryKey: ["journal", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("journals").select("*, topics(name), languages(name)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Layout><div className="container mx-auto px-4 py-12"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div></Layout>;
  if (!journal) return <Layout><div className="container mx-auto px-4 py-12 text-center"><p>Journal not found.</p></div></Layout>;

  return (
    <Layout>
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/journals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Journals
        </Link>
        {journal.featured_image_url && (
          <img src={journal.featured_image_url} alt={journal.title} className="w-full rounded-lg mb-6 shadow-lg" />
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {(journal.topics as any)?.name && <Badge variant="secondary">{(journal.topics as any).name}</Badge>}
          {(journal.languages as any)?.name && <Badge variant="outline">{(journal.languages as any).name}</Badge>}
          {journal.tags?.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{journal.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{new Date(journal.created_at).toLocaleDateString()}</p>
        <div className="prose prose-neutral max-w-none leading-relaxed whitespace-pre-wrap">{journal.body}</div>
      </article>
    </Layout>
  );
};

export default JournalDetailPage;
