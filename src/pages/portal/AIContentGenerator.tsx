import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save, Loader2 } from "lucide-react";

type ContentType = "books" | "journals" | "videos" | "podcasts" | "translations";

const CONTENT_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "books", label: "Book" },
  { value: "journals", label: "Journal / Article" },
  { value: "videos", label: "Video transcript" },
  { value: "podcasts", label: "Podcast transcript" },
  { value: "translations", label: "Translation source" },
];

interface AIPack {
  summary: string;
  key_takeaways: string[];
  outline: string;
  seo_tags: string[];
  yoga_tags: string[];
  podcast_script: string;
  beginner_version: string;
  translation_hi: string;
  translation_en: string;
}

const AIContentGenerator = () => {
  const { toast } = useToast();
  const [contentType, setContentType] = useState<ContentType>("books");
  const [recordId, setRecordId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pack, setPack] = useState<AIPack | null>(null);

  const records = useQuery({
    queryKey: ["ai-records", contentType],
    queryFn: async () => {
      const { data } = await supabase
        .from(contentType)
        .select("id, title")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const handleGenerate = async () => {
    if (sourceText.trim().length < 40) {
      toast({
        title: "Source text too short",
        description: "Paste at least a paragraph (40+ characters) of source content.",
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    setPack(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-ai", {
        body: { contentType, title, sourceText },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setPack((data as any).data);
      toast({ title: "Content generated", description: "Review the output below, then save it." });
    } catch (err: any) {
      const msg = err?.message || "Generation failed";
      toast({
        title: "AI generation failed",
        description:
          msg.includes("Rate limit")
            ? "Rate limit exceeded — please try again in a moment."
            : msg.includes("credits")
              ? "AI credits exhausted. Add credits in your Lovable workspace."
              : msg,
        variant: "destructive",
      });
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!pack) return;
    if (!recordId) {
      toast({
        title: "Pick a record",
        description: "Select which existing item to attach this content to.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const base: Record<string, any> = {
        ai_summary: pack.summary,
        ai_key_takeaways: pack.key_takeaways,
        ai_seo_tags: pack.seo_tags,
        ai_yoga_tags: pack.yoga_tags,
        ai_podcast_script: pack.podcast_script,
        ai_beginner_version: pack.beginner_version,
        ai_generated_at: new Date().toISOString(),
      };
      if (contentType !== "translations") {
        base.ai_outline = pack.outline;
        base.ai_translation_hi = pack.translation_hi;
        base.ai_translation_en = pack.translation_en;
      }
      const { error } = await supabase.from(contentType).update(base as any).eq("id", recordId);
      if (error) throw error;
      toast({ title: "Saved to record" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Content Studio
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste a transcript, article body, or book excerpt — generate summary, takeaways, outline, SEO + yoga tags, podcast script, beginner version, and Hindi/English translations.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Content type</Label>
            <Select
              value={contentType}
              onValueChange={(v) => {
                setContentType(v as ContentType);
                setRecordId("");
                setPack(null);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTENT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title (optional context)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patanjali Yoga Sutras — Chapter 1"
              maxLength={200}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Source text</Label>
          <Textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={10}
            maxLength={60000}
            placeholder="Paste the transcript, article body, book excerpt, or full description here..."
          />
          <p className="text-xs text-muted-foreground text-right">
            {sourceText.length.toLocaleString()} / 60,000 characters
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-gradient-gold text-primary-foreground border-0 shadow-gold hover:opacity-90"
        >
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {generating ? "Generating..." : "Generate full content pack"}
        </Button>

        {pack && (
          <div className="space-y-6 pt-6 border-t">
            <PackSection title="150-word Summary" body={pack.summary} />
            <ListSection title="5 Key Takeaways" items={pack.key_takeaways} />
            <PackSection title="Chapter / Section Outline" body={pack.outline} mono />
            <ListSection title="10 SEO Tags" items={pack.seo_tags} chips />
            <ListSection title="5 Yoga Topic Tags" items={pack.yoga_tags} chips />
            <PackSection title="Podcast Script" body={pack.podcast_script} />
            <PackSection title="Beginner-friendly Version" body={pack.beginner_version} />
            <PackSection title="Hindi Translation (हिन्दी)" body={pack.translation_hi} />
            <PackSection title="English Translation" body={pack.translation_en} />

            <div className="flex flex-col sm:flex-row gap-3 items-end pt-4 border-t">
              <div className="flex-1 space-y-2 w-full">
                <Label>Attach to existing {contentType} record</Label>
                <Select value={recordId} onValueChange={setRecordId}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${contentType.slice(0, -1)} to update`} />
                  </SelectTrigger>
                  <SelectContent>
                    {records.data?.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No records yet — create one in the {contentType} tab first.
                      </div>
                    )}
                    {records.data?.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving || !recordId} className="w-full sm:w-auto">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save to record
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PackSection = ({ title, body, mono }: { title: string; body: string; mono?: boolean }) => (
  <div>
    <h3 className="font-serif text-lg font-bold mb-2">{title}</h3>
    <div className={`whitespace-pre-wrap text-sm leading-relaxed bg-muted/40 rounded-lg p-4 ${mono ? "font-mono" : ""}`}>
      {body}
    </div>
  </div>
);

const ListSection = ({ title, items, chips }: { title: string; items: string[]; chips?: boolean }) => (
  <div>
    <h3 className="font-serif text-lg font-bold mb-2">{title}</h3>
    {chips ? (
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {it}
          </span>
        ))}
      </div>
    ) : (
      <ul className="list-disc pl-5 space-y-1 text-sm bg-muted/40 rounded-lg p-4">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    )}
  </div>
);

export default AIContentGenerator;
