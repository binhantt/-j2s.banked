const API_BASE_URL = 'http://localhost:8080/api';

export async function httpRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'Có lỗi xảy ra từ server';
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignore json parsing error
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

