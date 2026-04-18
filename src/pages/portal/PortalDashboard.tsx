import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTopics, useLanguages } from "@/hooks/useContentFilters";
import { BookOpen, Video, FileText, Headphones, Languages, Tag, Globe, LogOut, Sparkles } from "lucide-react";
import PortalLoginPage from "./PortalLoginPage";
import AIContentGenerator from "./AIContentGenerator";

type ContentTable = "books" | "videos" | "journals" | "podcasts" | "translations" | "topics" | "languages";

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: topics = [] } = useTopics();
  const { data: languages = [] } = useLanguages();

  const counts = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const tables: ContentTable[] = ["books", "videos", "journals", "podcasts", "translations"];
      const results: Record<string, number> = {};
      for (const t of tables) {
        const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
        results[t] = count || 0;
      }
      return results;
    },
    enabled: isAdmin,
  });

  if (loading) return <Layout><div className="container mx-auto px-4 py-12 text-center">Loading...</div></Layout>;
  if (!user || !isAdmin) return <PortalLoginPage />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Curator Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage all portal content</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-2" /> Sign Out</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Books", count: counts.data?.books ?? 0, icon: BookOpen },
            { label: "Videos", count: counts.data?.videos ?? 0, icon: Video },
            { label: "Journals", count: counts.data?.journals ?? 0, icon: FileText },
            { label: "Podcasts", count: counts.data?.podcasts ?? 0, icon: Headphones },
            { label: "Translations", count: counts.data?.translations ?? 0, icon: Languages },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for each content type */}
        <Tabs defaultValue="ai">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="ai" className="gap-1"><Sparkles className="h-3.5 w-3.5" /> AI Studio</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="journals">Journals</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>

          <TabsContent value="ai"><AIContentGenerator /></TabsContent>
          <TabsContent value="books"><BookForm topics={topics} languages={languages} toast={toast} qc={qc} /></TabsContent>
          <TabsContent value="videos"><VideoForm topics={topics} languages={languages} toast={toast} qc={qc} /></TabsContent>
          <TabsContent value="journals"><JournalForm topics={topics} languages={languages} toast={toast} qc={qc} /></TabsContent>
          <TabsContent value="podcasts"><PodcastForm topics={topics} languages={languages} toast={toast} qc={qc} /></TabsContent>
          <TabsContent value="translations"><TranslationForm topics={topics} languages={languages} toast={toast} qc={qc} /></TabsContent>
          <TabsContent value="topics"><TopicForm toast={toast} qc={qc} /></TabsContent>
          <TabsContent value="languages"><LanguageForm toast={toast} qc={qc} /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Helper: file upload
const uploadFile = async (file: File, bucket: string) => {
  const path = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Reusable form props
interface FormProps {
  topics?: any[];
  languages?: any[];
  toast: any;
  qc: any;
}

const BookForm = ({ topics, languages, toast, qc }: FormProps) => {
  const [form, setForm] = useState({ title: "", author: "", description: "", book_type: "modern", topic_id: "", language_id: "", is_featured: false });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let cover_url = null;
      let pdf_url = null;
      if (coverFile) cover_url = await uploadFile(coverFile, "cover-images");
      if (pdfFile) pdf_url = await uploadFile(pdfFile, "book-pdfs");
      const { error } = await supabase.from("books").insert({
        ...form,
        cover_url, pdf_url,
        topic_id: form.topic_id || null,
        language_id: form.language_id || null,
      });
      if (error) throw error;
      toast({ title: "Book added!" });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      setForm({ title: "", author: "", description: "", book_type: "modern", topic_id: "", language_id: "", is_featured: false });
      setCoverFile(null);
      setPdfFile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add New Book</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Author</Label><Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.book_type} onValueChange={v => setForm(f => ({ ...f, book_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="old">Old / Historical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={form.topic_id} onValueChange={v => setForm(f => ({ ...f, topic_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>{topics?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language_id} onValueChange={v => setForm(f => ({ ...f, language_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>{languages?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Cover Image</Label><Input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} /></div>
            <div className="space-y-2"><Label>PDF File</Label><Input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
            <Label>Featured</Label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Book"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const VideoForm = ({ topics, languages, toast, qc }: FormProps) => {
  const [form, setForm] = useState({ title: "", description: "", video_url: "", speaker: "", topic_id: "", language_id: "", is_featured: false });
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let thumbnail_url = null;
      if (thumbFile) thumbnail_url = await uploadFile(thumbFile, "cover-images");
      const { error } = await supabase.from("videos").insert({
        ...form, thumbnail_url,
        topic_id: form.topic_id || null,
        language_id: form.language_id || null,
      });
      if (error) throw error;
      toast({ title: "Video added!" });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      setForm({ title: "", description: "", video_url: "", speaker: "", topic_id: "", language_id: "", is_featured: false });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add New Video</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Video URL *</Label><Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} required placeholder="YouTube or Vimeo URL" /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Speaker</Label><Input value={form.speaker} onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={form.topic_id} onValueChange={v => setForm(f => ({ ...f, topic_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>{topics?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language_id} onValueChange={v => setForm(f => ({ ...f, language_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>{languages?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Thumbnail</Label><Input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} /></div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
            <Label>Featured</Label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Video"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const JournalForm = ({ topics, languages, toast, qc }: FormProps) => {
  const [form, setForm] = useState({ title: "", body: "", excerpt: "", topic_id: "", language_id: "", tags: "", is_featured: false });
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let featured_image_url = null;
      if (imgFile) featured_image_url = await uploadFile(imgFile, "cover-images");
      const { error } = await supabase.from("journals").insert({
        title: form.title, body: form.body, excerpt: form.excerpt, featured_image_url,
        topic_id: form.topic_id || null,
        language_id: form.language_id || null,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : null,
        is_featured: form.is_featured,
      });
      if (error) throw error;
      toast({ title: "Journal added!" });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      setForm({ title: "", body: "", excerpt: "", topic_id: "", language_id: "", tags: "", is_featured: false });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add New Journal</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
          <div className="space-y-2"><Label>Excerpt</Label><Input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Body</Label><Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={8} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={form.topic_id} onValueChange={v => setForm(f => ({ ...f, topic_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>{topics?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language_id} onValueChange={v => setForm(f => ({ ...f, language_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>{languages?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="yoga, meditation" /></div>
          </div>
          <div className="space-y-2"><Label>Featured Image</Label><Input type="file" accept="image/*" onChange={e => setImgFile(e.target.files?.[0] || null)} /></div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
            <Label>Featured</Label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Journal"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const PodcastForm = ({ topics, languages, toast, qc }: FormProps) => {
  const [form, setForm] = useState({ title: "", description: "", duration: "", topic_id: "", language_id: "", is_featured: false });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let audio_url = null;
      if (audioFile) audio_url = await uploadFile(audioFile, "audio-files");
      const { error } = await supabase.from("podcasts").insert({
        ...form, audio_url,
        topic_id: form.topic_id || null,
        language_id: form.language_id || null,
      });
      if (error) throw error;
      toast({ title: "Podcast added!" });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      setForm({ title: "", description: "", duration: "", topic_id: "", language_id: "", is_featured: false });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add New Podcast</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Duration</Label><Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="45 min" /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={form.topic_id} onValueChange={v => setForm(f => ({ ...f, topic_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>{topics?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language_id} onValueChange={v => setForm(f => ({ ...f, language_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>{languages?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Audio File</Label><Input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} /></div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
            <Label>Featured</Label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Podcast"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TranslationForm = ({ topics, languages, toast, qc }: FormProps) => {
  const [form, setForm] = useState({ title: "", source_text: "", translated_text: "", source_language_id: "", target_language_id: "", topic_id: "", is_featured: false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("translations").insert({
        ...form,
        topic_id: form.topic_id || null,
        source_language_id: form.source_language_id || null,
        target_language_id: form.target_language_id || null,
      });
      if (error) throw error;
      toast({ title: "Translation added!" });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      setForm({ title: "", source_text: "", translated_text: "", source_language_id: "", target_language_id: "", topic_id: "", is_featured: false });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add New Translation</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Source Text</Label><Textarea value={form.source_text} onChange={e => setForm(f => ({ ...f, source_text: e.target.value }))} rows={6} /></div>
            <div className="space-y-2"><Label>Translated Text</Label><Textarea value={form.translated_text} onChange={e => setForm(f => ({ ...f, translated_text: e.target.value }))} rows={6} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Source Language</Label>
              <Select value={form.source_language_id} onValueChange={v => setForm(f => ({ ...f, source_language_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{languages?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Language</Label>
              <Select value={form.target_language_id} onValueChange={v => setForm(f => ({ ...f, target_language_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{languages?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={form.topic_id} onValueChange={v => setForm(f => ({ ...f, topic_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>{topics?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
            <Label>Featured</Label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Translation"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TopicForm = ({ toast, qc }: FormProps) => {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("topics").insert({ name, slug });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Topic added!" }); setName(""); qc.invalidateQueries({ queryKey: ["topics"] }); }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add Topic</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hatha Yoga" required className="flex-1" />
          <Button type="submit" disabled={saving}>{saving ? "..." : "Add"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const LanguageForm = ({ toast, qc }: FormProps) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("languages").insert({ name, code });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Language added!" }); setName(""); setCode(""); qc.invalidateQueries({ queryKey: ["languages"] }); }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add Language</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sanskrit" required className="flex-1" />
          <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. sa" required className="w-24" />
          <Button type="submit" disabled={saving}>{saving ? "..." : "Add"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
