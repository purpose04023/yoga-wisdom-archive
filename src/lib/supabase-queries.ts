import { supabase } from '@/lib/supabase';

export interface Book {
  id: number;
  title: string;
  author?: string;
  description?: string;
  cover_url?: string;
  pdf_url?: string;
  book_type?: 'modern' | 'old';
  topic_id?: number;
  language_id?: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  topics?: { name: string };
  languages?: { name: string };
}

export interface Podcast {
  id: number;
  title: string;
  description?: string;
  audio_url: string;
  duration?: string;
  speaker?: string;
  topic_id?: number;
  language_id?: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  topics?: { name: string };
  languages?: { name: string };
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  speaker?: string;
  topic_id?: number;
  language_id?: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  topics?: { name: string };
  languages?: { name: string };
}

// ============ BOOKS ============

export async function fetchAllBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*, topics(name), languages(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return data || [];
}

export async function fetchBookById(id: number): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*, topics(name), languages(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching book:', error);
    return null;
  }

  return data;
}

export async function fetchFeaturedBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*, topics(name), languages(name)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured books:', error);
    return [];
  }

  return data || [];
}

export async function fetchBooksByTopic(topicId: number): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*, topics(name), languages(name)')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books by topic:', error);
    return [];
  }

  return data || [];
}

export async function fetchBooksByLanguage(languageId: number): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*, topics(name), languages(name)')
    .eq('language_id', languageId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books by language:', error);
    return [];
  }

  return data || [];
}

// Admin: Create book
export async function createBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .insert([book])
    .select('*, topics(name), languages(name)')
    .single();

  if (error) {
    console.error('Error creating book:', error);
    return null;
  }

  return data;
}

// Admin: Update book
export async function updateBook(id: number, updates: Partial<Book>): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select('*, topics(name), languages(name)')
    .single();

  if (error) {
    console.error('Error updating book:', error);
    return null;
  }

  return data;
}

// Admin: Delete book
export async function deleteBook(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting book:', error);
    return false;
  }

  return true;
}

// ============ PODCASTS ============

export async function fetchAllPodcasts(): Promise<Podcast[]> {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*, topics(name), languages(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching podcasts:', error);
    return [];
  }

  return data || [];
}

export async function fetchPodcastById(id: number): Promise<Podcast | null> {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*, topics(name), languages(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching podcast:', error);
    return null;
  }

  return data;
}

export async function fetchFeaturedPodcasts(): Promise<Podcast[]> {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*, topics(name), languages(name)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured podcasts:', error);
    return [];
  }

  return data || [];
}

export async function fetchPodcastsByTopic(topicId: number): Promise<Podcast[]> {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*, topics(name), languages(name)')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching podcasts by topic:', error);
    return [];
  }

  return data || [];
}

// Admin: Create podcast
export async function createPodcast(podcast: Omit<Podcast, 'id' | 'created_at' | 'updated_at'>): Promise<Podcast | null> {
  const { data, error } = await supabase
    .from('podcasts')
    .insert([podcast])
    .select('*, topics(name), languages(name)')
    .single();

  if (error) {
    console.error('Error creating podcast:', error);
    return null;
  }

  return data;
}

// Admin: Update podcast
export async function updatePodcast(id: number, updates: Partial<Podcast>): Promise<Podcast | null> {
  const { data, error } = await supabase
    .from('podcasts')
    .update(updates)
    .eq('id', id)
    .select('*, topics(name), languages(name)')
    .single();

  if (error) {
    console.error('Error updating podcast:', error);
    return null;
  }

  return data;
}

// Admin: Delete podcast
export async function deletePodcast(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('podcasts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting podcast:', error);
    return false;
  }

  return true;
}

// ============ VIDEOS ============

export async function fetchAllVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*, topics(name), languages(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return data || [];
}

export async function fetchVideoById(id: number): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('*, topics(name), languages(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching video:', error);
    return null;
  }

  return data;
}

export async function fetchFeaturedVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*, topics(name), languages(name)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured videos:', error);
    return [];
  }

  return data || [];
}

export async function fetchVideosByTopic(topicId: number): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*, topics(name), languages(name)')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos by topic:', error);
    return [];
  }

  return data || [];
}

// Admin: Create video
export async function createVideo(video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .insert([video])
    .select('*, topics(name), languages(name)')
    .single();

  if (error) {
    console.error('Error creating video:', error);
    return null;
  }

  return data;
}

// Admin: Update video
export async function updateVideo(id: number, updates: Partial<Video>): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select('*, topics(name), languages(name)')
    .single();

  if (error) {
    console.error('Error updating video:', error);
    return null;
  }

  return data;
}

// Admin: Delete video
export async function deleteVideo(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting video:', error);
    return false;
  }

  return true;
}

// ============ TOPICS & LANGUAGES ============

export async function fetchAllTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }

  return data || [];
}

export async function fetchAllLanguages() {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching languages:', error);
    return [];
  }

  return data || [];
}
