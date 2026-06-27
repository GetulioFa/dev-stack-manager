'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { CrudPage } from '@/components/crud/crud-page';
import { Column } from '@/components/crud/data-table';
import { useCrud } from '@/lib/hooks/use-crud';
import { citiesApi, statesApi } from '@/lib/api/services';
import { citySchema, CityFormValues } from '@/lib/schemas';
import { CityDto, StateDto } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// Form

function CityForm({ item, onClose, onSaved }: { 
  item: CityDto | null; 
  onClose: () => void; 
  onSaved: () => void;
}) {
  const [states, setStates] = useState<StateDto[]>([]);
  const [existingCities, setExistingCities] = useState<CityDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
 
  useEffect(() => {
    statesApi.list(1, 100).then(r => setStates(r.items)).catch(() => {});
    citiesApi.list(1, 1000).then(r => setExistingCities(r.items)).catch(() => {});
  }, []);

  const { register, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: { name: item?.name ?? '', stateId: item?.stateId ?? '' },
  });

  const selectedState = watch('stateId');

  const onSubmit = async (data: CityFormValues) => {
    const cityExists = existingCities.some(
      c => c.name.toLowerCase().trim() === data.name.toLowerCase().trim() && 
           c.stateId === data.stateId && 
           c.id !== item?.id
    );

    if (cityExists) {
      setError('name', { type: 'manual', message: 'Esta Cidade já está cadastrada neste estado.' });
      return;
    }

    try {
      setSubmitting(true);
      if (item) {
        await citiesApi.update(item.id, data.name, data.stateId);
        toast.success('Cidade atualizada com sucesso!');
      } else {
        await citiesApi.create(data.name, data.stateId);
        toast.success('Cidade criada com sucesso!');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 409) {
        setError('name', { type: 'manual', message: 'Esta Cidade já está cadastrada neste estado.' });
      } else {
        toast.error('Erro ao salvar Cidade.');
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da cidade</Label>
        <Input id="name" placeholder="Ex: São Paulo" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-xs text-destructive" role="alert">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Estado</Label>
        <Select 
          value={selectedState} 
          onValueChange={v => setValue('stateId', v, { shouldValidate: true })}
        >
          <SelectTrigger aria-invalid={!!errors.stateId}>
            <SelectValue placeholder="Selecione um Estado…" />
          </SelectTrigger>
          <SelectContent>
            {states.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.uf} — {s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.stateId && <p className="text-xs text-destructive" role="alert">{errors.stateId.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : item ? 'Salvar alterações' : 'Criar cidade'}
        </Button>
      </div>
    </form>
  );
}

// Page

const COLUMNS: Column<CityDto>[] = [
  { key: 'name',     header: 'Cidade',  cell: r => r.name },
  {
    key: 'stateUF', header: 'Estado',
    cell: r => (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono font-bold tracking-widest">{r.stateUF}</Badge>
        <span className="text-muted-foreground text-sm">{r.stateName}</span>
      </div>
    ),
  },
  {
    key: 'createdAt', header: 'Criado em',
    className: 'text-muted-foreground text-sm w-40',
    cell: r => new Date(r.createdAt).toLocaleDateString('pt-BR'),
  },
];

export default function CitiesPage() {
  const [states, setStates] = useState<StateDto[]>([]);
  
  const crudOptions = useMemo(() => ({
    listFn: (f: any) => citiesApi.list(f?.page, f?.pageSize, f?.stateId),
    deleteFn: (id: unknown) => citiesApi.delete(id as string),
    messages: { deleted: 'Cidade excluída com sucesso.' },
  }), []);

  const crud = useCrud<CityDto, { page: number; pageSize: number; stateId?: string }>(crudOptions);

  useEffect(() => { 
    statesApi.list(1, 100).then(r => setStates(r.items)); 
  }, []);

  return (
    <CrudPage
      title="Cidades"
      description="Gerencie as Cidades do Sistema."
      createLabel="Adicionar Cidade"
      columns={COLUMNS}
      data={crud.items}
      rowKey={r => r.id}
      isLoading={crud.isLoading}
      isSubmitting={crud.isSubmitting}
      page={crud.filters.page ?? 1}
      totalPages={crud.totalPages}
      totalCount={crud.total}
      
      onPageChange={p => crud.setFilters({ ...crud.filters, page: p })}
      
      onDelete={item => crud.remove(item.id)}
      deleteMessage={item => `Deseja excluir a Cidade "${item.name}"?`}
      renderFilters={
        <Select 
          value={crud.filters.stateId ?? ''}
          onValueChange={v => crud.setFilters({ ...crud.filters, stateId: v || undefined, page: 1 })}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrar por Estado…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os estados</SelectItem>
            {states.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.uf} — {s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      renderForm={({ item, onClose }) => (
        <CityForm item={item} onClose={onClose} onSaved={crud.refresh} />
      )}
      emptyMessage="Nenhuma Cidade cadastrada."
    />
  );
}