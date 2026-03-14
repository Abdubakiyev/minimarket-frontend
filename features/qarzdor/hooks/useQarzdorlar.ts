// features/qarzdor/hooks/useQarzdorlar.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { qarzdorApi } from '../api';
import { Qarzdor, QarzdorlarResponse, CreateQarzdorDto, TolovQilishDto } from '../types';

export function useQarzdorlar(statusFilter?: string) {
  const [data, setData] = useState<QarzdorlarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await qarzdorApi.getAll(statusFilter);
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useQarzdor(id: number) {
  const [data, setData] = useState<Qarzdor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await qarzdorApi.getOne(id);
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useQarzdorActions(refetch: () => void) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const create = async (dto: CreateQarzdorDto) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await qarzdorApi.create(dto);
      showSuccess('✅ Yangi qarzdor qo\'shildi!');
      refetch();
      return true;
    } catch (e: any) {
      setActionError(e.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const tolovQilish = async (id: number, dto: TolovQilishDto) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await qarzdorApi.tolovQilish(id, dto);
      showSuccess(res.xabar);
      refetch();
      return true;
    } catch (e: any) {
      setActionError(e.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const qarzQosh = async (id: number, miqdor: number) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await qarzdorApi.qarzQosh(id, miqdor);
      showSuccess('✅ Qarz qo\'shildi!');
      refetch();
      return true;
    } catch (e: any) {
      setActionError(e.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const remove = async (id: number) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await qarzdorApi.remove(id);
      showSuccess('🗑️ O\'chirildi!');
      refetch();
      return true;
    } catch (e: any) {
      setActionError(e.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    actionError,
    successMsg,
    create,
    tolovQilish,
    qarzQosh,
    remove,
  };
}

export function useSearch() {
  const [results, setResults] = useState<Qarzdor[]>([]);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const res = await qarzdorApi.search(q);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  return { results, searching, query, search };
}