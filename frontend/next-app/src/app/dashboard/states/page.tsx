'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CrudPage } from '@/components/crud/crud-page';
import { Column } from '@/components/crud/data-table';
import { useCrud } from '@/lib/hooks/use-crud';
import { statesApi } from '@/lib/api/services';
import { stateSchema, StateFormValues } from '@/lib/schemas';
import { StateDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const CRUD_OPTIONS = {
  listFn:   (f: { page: number; pageSize: number }) =>
    statesApi.list(f.page, f.pageSize),
  deleteFn: (id: unknown) => statesApi.delete(id as string),
  messages: { deleted: 'Estado excluído.' },
};

// Form

function StateForm({ item, onClose, onSaved }: {
  item:    StateDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, reset, formState: { errors }, setError } =
    useForm<StateFormValues>({
      resolver: zodResolver(stateSchema),
      defaultValues: { name: item?.name ?? '', uf: item?.uf ?? '' },
    });

  useEffect(() => {
    reset({ name: item?.name ?? '', uf: item?.uf ?? '' });
  }, [item, reset]);

  const [submitting, setSubmitting] = [false, () => {}];

  const onSubmit = async (values: StateFormValues) => {
    try {
      if (item) {
        await statesApi.update(item.id, values.name, values.uf);
      } else {
        await statesApi.create(values.name, values.uf);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 409) {
        setError('uf', { message: 'Já existe um estado com esta UF.' });
      } else {
        throw err;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-2">

      <div className="space-y-1.5">
        <Label htmlFor="s-name">Nome do estado</Label>
        <Input id="s-name" placeholder="ex: São Paulo"
               {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && (
          <p className="text-xs text-destructive" role="alert">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="s-uf">UF (2 letras)</Label>
        <Input id="s-uf" placeholder="SP" maxLength={2}
               className="uppercase tracking-widest font-mono"
               {...register('uf')} aria-invalid={!!errors.uf} />
        {errors.uf && (
          <p className="text-xs text-destructive" role="alert">{errors.uf.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">
          {item ? 'Salvar alterações' : 'Criar estado'}
        </Button>
      </div>
    </form>
  );
}

// Columns

const COLUMNS: Column<StateDto>[] = [
  {
    key: 'uf', header: 'UF',
    className: 'w-20',
    cell: row => (
      <Badge variant="outline" className="font-mono font-bold tracking-widest">
        {row.uf}
      </Badge>
    ),
  },
  { key: 'name', header: 'Nome', cell: row => <span className="font-medium">{row.name}</span> },
  {
    key: 'createdAt', header: 'Criado em',
    className: 'text-muted-foreground text-sm w-40',
    cell: row => new Date(row.createdAt).toLocaleDateString('pt-BR'),
  },
];

// Page

export default function StatesPage() {
  const crud = useCrud<StateDto, { page: number; pageSize: number }>(CRUD_OPTIONS);

  return (
    <CrudPage
      title="Estados"
      description="Gerencie os estados do sistema."
      createLabel="Novo estado"
      columns={COLUMNS}
      data={crud.items}
      rowKey={r => r.id}
      isLoading={crud.isLoading}
      isSubmitting={crud.isSubmitting}
      page={crud.filters.page ?? 1}
      totalPages={crud.totalPages}
      totalCount={crud.total} 
      onPageChange={p => crud.setFilters({ page: p })}
      onDelete={item => crud.remove(item.id)}
      deleteMessage={item => `Deseja excluir o estado "${item.name} (${item.uf})"? Cidades vinculadas podem ser afetadas.`}
      renderForm={({ item, onClose }) => (
        <StateForm item={item} onClose={onClose} onSaved={crud.refresh} />
      )}
      emptyMessage="Nenhum estado cadastrado."
    />
  );
}