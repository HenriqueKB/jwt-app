const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    document.cookie = 'biblioteca_session=; path=/; max-age=0';
    window.location.href = '/login';
  }
};

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

    if (!refreshToken) {
      clearSession();
      throw new Error('Sessão expirada');
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(`${API_URL}${endpoint}`, { ...options, headers }).then(
          async (retryRes) => {
            const retryData = await retryRes.json().catch(() => ({}));
            if (!retryRes.ok) {
              throw new Error(retryData.error || 'Erro na requisição');
            }
            return retryData as T;
          }
        );
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const refreshData = await refreshRes.json().catch(() => ({}));

      if (!refreshRes.ok || !refreshData.accessToken) {
        processQueue(new Error('Refresh inválido'), null);
        clearSession();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      localStorage.setItem('accessToken', refreshData.accessToken);
      localStorage.setItem('refreshToken', refreshData.refreshToken);

      processQueue(null, refreshData.accessToken);

      headers.set('Authorization', `Bearer ${refreshData.accessToken}`);
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const retryData = await retryResponse.json().catch(() => ({}));
      if (!retryResponse.ok) {
        throw new Error(retryData.error || 'Erro na requisição');
      }
      return retryData as T;
    } catch (err) {
      processQueue(err, null);
      clearSession();
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro ${response.status} na requisição`);
  }

  return data as T;
}