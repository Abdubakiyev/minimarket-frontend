// features/qarzdor/api/index.ts

import {
  CreateQarzdorDto,
  Qarzdor,
  QarzdorlarResponse,
  TolovQilishDto,
  TolovResponse,
} from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://minimarket-backend-3t1d.onrender.com/api';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Xato yuz berdi' }));
    throw new Error(error.message || 'Server xatosi');
  }

  return res.json();
}

export const qarzdorApi = {
  // Barcha qarzdorlar + statistika
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetcher<QarzdorlarResponse>(`/qarzdorlar${query}`);
  },

  // Bitta qarzdor
  getOne: (id: number) => fetcher<Qarzdor>(`/qarzdorlar/${id}`),

  // Qidirish
  search: (q: string) => fetcher<Qarzdor[]>(`/qarzdorlar/search?q=${q}`),

  // Yangi qarzdor
  create: (dto: CreateQarzdorDto) =>
    fetcher<Qarzdor>('/qarzdorlar', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  // To'lov qilish
  tolovQilish: (id: number, dto: TolovQilishDto) =>
    fetcher<TolovResponse>(`/qarzdorlar/${id}/tolov`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  // Qo'shimcha qarz
  qarzQosh: (id: number, miqdor: number) =>
    fetcher<Qarzdor>(`/qarzdorlar/${id}/qarz-qosh`, {
      method: 'PATCH',
      body: JSON.stringify({ miqdor }),
    }),

  // O'chirish
  remove: (id: number) =>
    fetcher<{ xabar: string }>(`/qarzdorlar/${id}`, {
      method: 'DELETE',
    }),
};