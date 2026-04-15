
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create topics table
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create languages table
CREATE TABLE public.languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover_url TEXT,
  pdf_url TEXT,
  topic_id UUID REFERENCES public.topics(id),
  language_id UUID REFERENCES public.languages(id),
  book_type TEXT NOT NULL DEFAULT 'modern' CHECK (book_type IN ('modern', 'old')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  topic_id UUID REFERENCES public.topics(id),
  language_id UUID REFERENCES public.languages(id),
  speaker TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journals table
CREATE TABLE public.journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  topic_id UUID REFERENCES public.topics(id),
  language_id UUID REFERENCES public.languages(id),
  tags TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create podcasts table
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  topic_id UUID REFERENCES public.topics(id),
  language_id UUID REFERENCES public.languages(id),
  duration TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create translations table
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source_text TEXT,
  translated_text TEXT,
  source_language_id UUID REFERENCES public.languages(id),
  target_language_id UUID REFERENCES public.languages(id),
  topic_id UUID REFERENCES public.topics(id),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Public read policies for content tables
CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Anyone can view journals" ON public.journals FOR SELECT USING (true);
CREATE POLICY "Anyone can view podcasts" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Anyone can view translations" ON public.translations FOR SELECT USING (true);

-- Admin write policies for content tables
CREATE POLICY "Admins can manage topics" ON public.topics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage books" ON public.books FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage videos" ON public.videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage journals" ON public.journals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage podcasts" ON public.podcasts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage translations" ON public.translations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage languages" ON public.languages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON public.journals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON public.podcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON public.translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('book-pdfs', 'book-pdfs', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-images', 'cover-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);

-- Storage policies
CREATE POLICY "Public read access for cover images" ON storage.objects FOR SELECT USING (bucket_id = 'cover-images');
CREATE POLICY "Public read access for book PDFs" ON storage.objects FOR SELECT USING (bucket_id = 'book-pdfs');
CREATE POLICY "Public read access for audio files" ON storage.objects FOR SELECT USING (bucket_id = 'audio-files');
CREATE POLICY "Admins can upload cover images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cover-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload book PDFs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload audio files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cover images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cover-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update book PDFs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update audio files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'audio-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cover images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cover-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete book PDFs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete audio files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'audio-files' AND public.has_role(auth.uid(), 'admin'));
