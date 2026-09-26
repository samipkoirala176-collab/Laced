import { API_BASE_URL } from '../services/api';

export function buildImageUrl(imagePath) {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  return `${API_BASE_URL}${imagePath}`;
}
