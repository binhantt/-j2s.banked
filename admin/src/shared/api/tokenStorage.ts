// Helper để đọc token từ localStorage (dùng cho httpClient - không phải React component)
// Không dùng hook vì httpClient là plain function
export function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-store');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}
