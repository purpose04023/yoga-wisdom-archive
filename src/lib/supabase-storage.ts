import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

const BUCKETS = {
  COVERS: 'cover-images',
  PDFS: 'book-pdfs',
  AUDIO: 'audio-files',
  THUMBNAILS: 'video-thumbnails',
};

async function maybeCompressImage(file: File): Promise<File> {
  try {
    if (!file.type.startsWith('image/')) return file;

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    } as any;

    const compressed = await imageCompression(file as Blob, options);
    // imageCompression may return a Blob — convert back to File when possible
    if (compressed instanceof File) return compressed;
    return new File([compressed], file.name, { type: file.type });
  } catch (err) {
    return file;
  }
}

export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  file: File,
  path?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const bucketName = BUCKETS[bucket];
    const fileToUpload = await maybeCompressImage(file);

    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileToUpload, { upsert: true });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: String(err) };
  }
}

export async function uploadBookCover(file: File): Promise<{ url: string | null; error: string | null }> {
  return uploadFile('COVERS', file, 'books');
}

export async function uploadBookPDF(file: File): Promise<{ url: string | null; error: string | null }> {
  return uploadFile('PDFS', file, 'books');
}

export async function uploadPodcastAudio(file: File): Promise<{ url: string | null; error: string | null }> {
  return uploadFile('AUDIO', file, 'podcasts');
}

export async function uploadVideoThumbnail(file: File): Promise<{ url: string | null; error: string | null }> {
  return uploadFile('THUMBNAILS', file, 'videos');
}

export async function deleteFile(bucket: keyof typeof BUCKETS, filePath: string): Promise<{ error: string | null }> {
  try {
    const bucketName = BUCKETS[bucket];
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: String(err) };
  }
}

export function getPublicUrl(bucket: keyof typeof BUCKETS, filePath: string): string {
  const bucketName = BUCKETS[bucket];
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
