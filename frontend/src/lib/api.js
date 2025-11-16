export const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch(path, options = {}) {
  const url = `${baseUrl}${path}`;
  return fetch(url, options);
}

export default apiFetch;
