'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PagedResult } from '@/types';
import { ApiClientError } from '@/lib/api/client';
import { toast } from 'sonner';

export interface CrudFilters {
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

interface UseCrudOptions<T, F extends CrudFilters> {
  listFn: (filters: F) => Promise<PagedResult<T>>;
  createFn?: (data: unknown) => Promise<T>;
  updateFn?: (id: string, data: unknown) => Promise<T>;
  deleteFn?: (id: string | unknown) => Promise<void>;
  initialFilters?: Partial<F>;
  messages?: {
    created?: string;
    updated?: string;
    deleted?: string;
  };
}

export interface UseCrudReturn<T, F extends CrudFilters> {
  items: T[];
  total: number;
  totalPages: number;
  filters: F;
  isLoading: boolean;
  isSubmitting: boolean;
  setFilters: (filters: Partial<F>) => void;
  refresh: () => void;
  create: (data: unknown) => Promise<T | null>;
  update: (id: string, data: unknown) => Promise<T | null>;
  remove: (id: string | unknown) => Promise<boolean>;
}

export function useCrud<T, F extends CrudFilters = CrudFilters>(
  options: UseCrudOptions<T, F>,
): UseCrudReturn<T, F> {
  const {
    listFn, createFn, updateFn, deleteFn,
    initialFilters = {},
    messages = {},
  } = options;

  const [items,       setItems]       = useState<T[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [isLoading,   setLoading]     = useState(true);
  const [isSubmitting,setSubmitting]  = useState(false);
  const [filters,     setFiltersState] = useState<F>({
    page: 1, pageSize: 10, ...initialFilters,
  } as F);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const load = useCallback(async (f: F) => {
    setLoading(true);
    try {
      const res = await listFn(f);
      setItems(res.items);
      setTotal(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err) {
      handleError(err, 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [listFn]);

  useEffect(() => {
    load(filters);
  }, [filters]);

  const setFilters = useCallback((partial: Partial<F>) => {
    setFiltersState(prev => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    load(filtersRef.current);
  }, [load]);

  const create = useCallback(async (data: unknown): Promise<T | null> => {
    if (!createFn) return null;
    setSubmitting(true);
    try {
      const result = await createFn(data);
      toast.success(messages.created ?? 'Criado com sucesso!');
      refresh();
      return result;
    } catch (err) {
      handleError(err, 'Erro ao criar.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [createFn, messages.created, refresh]);

  const update = useCallback(async (id: string, data: unknown): Promise<T | null> => {
    if (!updateFn) return null;
    setSubmitting(true);
    try {
      const result = await updateFn(id, data);
      toast.success(messages.updated ?? 'Atualizado com sucesso!');
      refresh();
      return result;
    } catch (err) {
      handleError(err, 'Erro ao atualizar.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [updateFn, messages.updated, refresh]);

  const remove = useCallback(async (id: string | unknown): Promise<boolean> => {
    if (!deleteFn) return false;
    setSubmitting(true);
    try {
      await deleteFn(id);
      toast.success(messages.deleted ?? 'Excluído com sucesso!');
      refresh();
      return true;
    } catch (err) {
      handleError(err, 'Erro ao excluir.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [deleteFn, messages.deleted, refresh]);

  return {
    items, total, totalPages, filters, isLoading, isSubmitting,
    setFilters, refresh, create, update, remove,
  };
}

// Error handler

function handleError(err: unknown, fallback: string): void {
  if (err instanceof ApiClientError) {
    if (err.validationErrors?.length) {
      err.validationErrors.forEach(e =>
        toast.error(e.message)
      );
    } else {
      toast.error(err.detail || fallback);
    }
  } else {
    toast.error(fallback);
  }
}

/**
 * Um wrapper do useCrud que adiciona automaticamente os campos de paginação
 * (page e pageSize) ao tipo de filtro customizado, simplificando a assinatura.
 */
export function usePagedCrud<T, F extends Record<string, unknown> = Record<string, unknown>>(
  options: UseCrudOptions<T, F & { page?: number; pageSize?: number }>
) {
  return useCrud<T, F & { page?: number; pageSize?: number }>(options);
}

export { handleError };
