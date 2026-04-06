const FINGERPRINT_KEY = 'anti-debug-fingerprint-user';

type AntiDebugStatus = {
  locked: boolean;
  lockRemainingSeconds: number;
};

const getBaseUrl = () => {
  const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return runtimeEnv?.env?.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

export const getUserAntiDebugFingerprint = (): string => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const existing = localStorage.getItem(FINGERPRINT_KEY);
  if (existing) {
    return existing;
  }

  const raw = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const fingerprint = `u-${raw}`;
  localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  return fingerprint;
};

export const reportUserAntiDebugEvent = async (
  route: string,
  event: string,
  fingerprint: string
): Promise<AntiDebugStatus> => {
  const response = await fetch(`${getBaseUrl()}/api/security/anti-debug/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      app: 'user-web',
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

export const getUserAntiDebugStatus = async (fingerprint: string): Promise<AntiDebugStatus> => {
  const query = new URLSearchParams({
    app: 'user-web',
    fingerprint,
  });

  const response = await fetch(`${getBaseUrl()}/api/security/anti-debug/status?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return { locked: false, lockRemainingSeconds: 0 };
  }

  return response.json() as Promise<AntiDebugStatus>;
};
