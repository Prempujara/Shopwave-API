const API_BASE = '/api';

export const getStoredToken = (): string | null => {
  return localStorage.getItem('shopwave_token');
};

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('shopwave_token', token);
  } else {
    localStorage.removeItem('shopwave_token');
  }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || (data?.errors ? JSON.stringify(data.errors) : 'Something went wrong');
    throw new Error(errorMsg);
  }

  return data;
};
