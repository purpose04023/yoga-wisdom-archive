import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const getEmbedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
};

const VideoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*, topics(name), languages(name)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Layout><div className="container mx-auto px-4 py-12"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div></Layout>;
  if (!video) return <Layout><div className="container mx-auto px-4 py-12 text-center"><p>Video not found.</p></div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/videos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Videos
        </Link>
        <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
          <iframe src={getEmbedUrl(video.video_url)} className="w-full h-full" title={video.title} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(video.topics as any)?.name && <Badge variant="secondary">{(video.topics as any).name}</Badge>}
          {(video.languages as any)?.name && <Badge variant="outline">{(video.languages as any).name}</Badge>}
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">{video.title}</h1>
        {video.speaker && <p className="text-muted-foreground mb-4">Speaker: {video.speaker}</p>}
        {video.description && <p className="text-muted-foreground leading-relaxed">{video.description}</p>}
      </div>
    </Layout>
  );
};

export default VideoDetailPage;
