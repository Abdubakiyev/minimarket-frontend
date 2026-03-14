// features/qarzdor/types/index.ts

export interface Tolov {
  id: number;
  miqdor: number;
  sana: string;
  izoh?: string;
  qarzdorId: number;
}

export interface Qarzdor {
  id: number;
  kim: string;
  umumiyQarz: number;
  tolangan: number;
  qoliqQarz: number;
  status: 'QARZDOR' | 'TOLANDI';
  izoh?: string;
  createdAt: string;
  updatedAt: string;
  tolovlar: Tolov[];
}

export interface Statistika {
  jamiQarzdorlar: number;
  jamiQarz: number;
  jamiTolangan: number;
  jamiQoliq: number;
}

export interface QarzdorlarResponse {
  qarzdorlar: Qarzdor[];
  statistika: Statistika;
}

export interface CreateQarzdorDto {
  kim: string;
  umumiyQarz: number;
  izoh?: string;
}

export interface TolovQilishDto {
  miqdor: number;
  izoh?: string;
}

export interface TolovResponse {
  xabar: string;
  qarzdor: Qarzdor;
  tolov: Tolov;
}