import { api } from './api';

/** Uploads a file to /upload/file and returns its public URL. Throws on failure. */
export async function uploadReferenceFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await api.upload<{ success: boolean; data: { url: string } }>('/upload/file', formData);
  if (!result.success || !result.data?.url) throw new Error('Failed to upload file');
  return result.data.url;
}
