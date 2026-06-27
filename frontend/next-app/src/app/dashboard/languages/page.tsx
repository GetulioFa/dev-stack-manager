'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CrudPage } from '@/components/crud/crud-page';
import { Column } from '@/components/crud/data-table';
import { useCrud, handleError } from '@/lib/hooks/use-crud';
import { languagesApi } from '@/lib/api/services';
import { languageSchema, LanguageFormValues } from '@/lib/schemas';
import { LanguageDto, LanguageType, LANGUAGE_TYPE_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// LanguageType: Badge colours

const TYPE_VARIANT: Record<LanguageType, string> = {
  [LanguageType.FrontEnd]: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  [LanguageType.BackEnd]:  'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  [LanguageType.Mobile]:   'bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300',
  [LanguageType.Database]: 'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  [LanguageType.DevOps]:   'bg-slate-100  text-slate-700  dark:bg-slate-700     dark:text-slate-300',
};

function LanguageTypeBadge({ type }: { type: LanguageType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5
                      text-xs font-medium ${TYPE_VARIANT[type]}`}>
      {LANGUAGE_TYPE_LABELS[type]}
    </span>
  );
}

// Form

function LanguageForm({ item, onClose, onSaved }: { 
  item: LanguageDto | null; 
  onClose: () => void;
  onSaved: () => void; 
}) {
  
  const [existingLanguages, setExistingLanguages] = useState<LanguageDto[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    languagesApi.list(1, 1000)
      .then(r => setExistingLanguages(r.items))
      .catch(() => {});
  }, []);
  
  const {
    register, handleSubmit, reset, control, setError, formState: { errors },
  } = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: { name: item?.name ?? '', type: item?.type ?? ('' as unknown as LanguageType) },
  });

  useEffect(() => {
    reset({
      name: item?.name ?? '',
      type: item?.type ?? ('' as unknown as LanguageType),
    });
  }, [item, reset]);

  const onSubmit = async (values: LanguageFormValues) => {
    const nameExists = existingLanguages.some(
      l => l.name.toLowerCase().trim() === values.name.toLowerCase().trim() && l.id !== item?.id
    );

    if (nameExists) {
      setError('name', { type: 'manual', message: 'Esta linguagem já está cadastrada.' });
      return;
    }

    try {
      setSubmitting(true);
      if (item) {
        await languagesApi.update(item.id, values.name, values.type);
        toast.success('Linguagem atualizada!');
      } else {
        await languagesApi.create(values.name, values.type);
        toast.success('Linguagem criada!');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 409) {
        setError('name', { type: 'manual', message: 'Esta linguagem já está cadastrada.' });
      } else {
        handleError(err, 'Erro ao salvar linguagem.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-2">

      <div className="space-y-1.5">
        <Label htmlFor="l-name">Nome</Label>
        <Input id="l-name" placeholder="ex: TypeScript" {...register('name')} aria-invalid={!!errors.name}/>
        {errors.name && <p className="text-xs text-destructive" role="alert">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Tipo</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ''}
              onValueChange={v => field.onChange(Number(v) as LanguageType)}
            >
              <SelectTrigger aria-invalid={!!errors.type}>
                <SelectValue placeholder="Selecione o tipo…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGE_TYPE_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="text-xs text-destructive" role="alert">{errors.type.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : item ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}

// Columns 

const COLUMNS: Column<LanguageDto>[] = [
  { key: 'name', header: 'Nome', cell: r => <span className="font-medium">{r.name}</span> },
  { key: 'type', header: 'Tipo', cell: r => <LanguageTypeBadge type={r.type} /> },
  {
    key: 'createdAt', header: 'Criado em',
    className: 'text-muted-foreground text-sm w-40',
    cell: r => new Date(r.createdAt).toLocaleDateString('pt-BR'),
  },
];

// Page

export default function LanguagesPage() {
  const crudOptions = useMemo(() => ({
      listFn: (f: any) => languagesApi.list(f?.page ?? 1, f?.pageSize ?? 10, f.type),
      deleteFn: (id: unknown) => languagesApi.delete(id as string),
      messages: { deleted: 'Linguagem excluída.' },
  }), []);

  const crud = useCrud<LanguageDto, { page: number; pageSize: number; type?: LanguageType }>(crudOptions);

  const handleTypeFilter = (value: string) => {
    crud.setFilters({ type: value === '__all' ? undefined : Number(value) as LanguageType });
  };

  return (
    <CrudPage
      title="Linguagens de Programação"
      description="Gerencie as linguagens disponíveis no sistema."
      createLabel="Nova linguagem"
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
      deleteMessage={item => `Deseja excluir a linguagem "${item.name}"?`}
      renderFilters={
        <Select onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todos os tipos</SelectItem>
            {Object.entries(LANGUAGE_TYPE_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      renderForm={({ item, onClose }) => <LanguageForm item={item} onClose={onClose} onSaved={crud.refresh} />}
      emptyMessage="Nenhuma linguagem cadastrada."
    />
  );
}