const FINGERPRINT_KEY = 'anti-debug-fingerprint-admin';

type AntiDebugStatus = {
  locked: boolean;
  lockRemainingSeconds: number;
};

const getBaseUrl = () => {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api';
};

export const getAdminAntiDebugFingerprint = (): string => {
  const existing = localStorage.getItem(FINGERPRINT_KEY);
  if (existing) {
    return existing;
  }

  const raw = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const fingerprint = `a-${raw}`;
  localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  return fingerprint;
};

export const reportAdminAntiDebugEvent = async (
  route: string,
  event: string,
  fingerprint: string
): Promise<AntiDebugStatus> => {
  const response = await fetch(`${getBaseUrl()}/security/anti-debug/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      app: 'admin-web',
      route,
      event,
      fingerprint,
    }),
  });

  if (!response.ok) {
    return { locked: false, lockRemainingSeconds: 0 };
  }

  return response.json() as Promise<AntiDebugStatus>;
};

export const getAdminAntiDebugStatus = async (fingerprint: string): Promise<AntiDebugStatus> => {
  const query = new URLSearchParams({
    app: 'admin-web',
    fingerprint,
  });

  const response = await fetch(`${getBaseUrl()}/security/anti-debug/status?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return { locked: false, lockRemainingSeconds: 0 };
  }

  return response.json() as Promise<AntiDebugStatus>;
};
