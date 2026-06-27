'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CrudPage } from '@/components/crud/crud-page';
import { Column } from '@/components/crud/data-table';
import { useCrud, usePagedCrud } from '@/lib/hooks/use-crud';
import { developersApi, statesApi, citiesApi, languagesApi, DeveloperFilters } from '@/lib/api/services';
import { developerSchema, DeveloperFormValues } from '@/lib/schemas';
import {
  DeveloperDto, StateDto, CityDto, LanguageDto,
  Seniority, SENIORITY_LABELS, LanguageType, LANGUAGE_TYPE_LABELS,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// Seniority badge

const SENIORITY_CLS: Record<Seniority, string> = {
  [Seniority.Junior]: 'bg-sky-100    text-sky-800    dark:bg-sky-900/40    dark:text-sky-300',
  [Seniority.Pleno]:  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  [Seniority.Senior]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

function SeniorityBadge({ value }: { value: Seniority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5
                      text-xs font-semibold ${SENIORITY_CLS[value]}`}>
      {SENIORITY_LABELS[value]}
    </span>
  );
}

// Language type badge (mini)

const TYPE_CLS: Record<LanguageType, string> = {
  [LanguageType.FrontEnd]: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  [LanguageType.BackEnd]:  'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  [LanguageType.Mobile]:   'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  [LanguageType.Database]: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  [LanguageType.DevOps]:   'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
};

// Developer Form

function DeveloperForm({ item, onClose }: { item: DeveloperDto | null; onClose: () => void }) {
  const [states,    setStates]    = useState<StateDto[]>([]);
  const [cities,    setCities]    = useState<CityDto[]>([]);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const crudOptions = useMemo(() => ({
    listFn: async () => ({ 
      items: [] as DeveloperDto[], 
      totalCount: 0, 
      total: 0, 
      page: 1, 
      pageSize: 10, 
      totalPages: 1 
    }),
    
    deleteFn: async () => {},        
    createFn: (d: unknown) => { const v = d as DeveloperFormValues; return developersApi.create(v); },
    updateFn: (id: string, d: unknown) => { const v = d as DeveloperFormValues; return developersApi.update(id, v); },
    messages: { 
      created: 'Desenvolvedor criado!', 
      updated: 'Desenvolvedor atualizado!',
      deleted: 'Desenvolvedor excluído.' 
    },
  }), []);

  const crud = useCrud<DeveloperDto>(crudOptions);
 
  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors },
    } = useForm<DeveloperFormValues>({
      resolver: zodResolver(developerSchema),
      defaultValues: {
        name:        item?.name        ?? '',
        email:       item?.email       ?? '',
        seniority:   item?.seniority   ?? ('' as unknown as Seniority),
        stateId:     '',
        cityId:      item?.cityId      ?? '',
        languageIds: item?.languages.map(l => l.id) ?? [],
      },
  });

  const watchedState = watch('stateId');

  useEffect(() => {
    statesApi.list(1, 100).then(r => setStates(r.items));
    languagesApi.list(1, 100).then(r => setLanguages(r.items));
  }, []);

  useEffect(() => {
    if (!item) return;
    statesApi.list(1, 100).then(r => {
      const state = r.items.find(s => s.uf === item.stateUF);
      if (state) {
        setValue('stateId', state.id);
        citiesApi.list(1, 200, state.id).then(cr => {
          setCities(cr.items);
          setValue('cityId', item.cityId);
        });
      }
    });
  }, [item, setValue]);

  useEffect(() => {
    if (!watchedState) { setCities([]); setValue('cityId', ''); return; }
    setLoadingCities(true);
    citiesApi.list(1, 200, watchedState).then(r => {
      setCities(r.items);
      setLoadingCities(false);
      if (!item) setValue('cityId', '');
    });
  }, [watchedState]);

  const onSubmit = async (values: DeveloperFormValues) => {
    const payload = {
      name:        values.name,
      email:       values.email,
      seniority:   Number(values.seniority) as Seniority,
      cityId:      values.cityId,
      languageIds: values.languageIds,
    };
    const result = item
      ? await crud.update(item.id, payload)
      : await crud.create(payload);
    if (result) onClose();
  };

  const watchedLangs = watch('languageIds');

  const langsByType = languages.reduce<Record<string, LanguageDto[]>>((acc, lang) => {
    const label = LANGUAGE_TYPE_LABELS[lang.type];
    acc[label] = [...(acc[label] ?? []), lang];
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-2">

      <div className="space-y-1.5">
        <Label htmlFor="d-name">Nome completo</Label>
        <Input id="d-name" placeholder="Nome do desenvolvedor" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="d-email">E-mail</Label>
        <Input id="d-email" type="email" placeholder="dev@email.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Senioridade</Label>
        <Controller
          name="seniority"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ''}
              onValueChange={v => field.onChange(Number(v) as Seniority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a senioridade…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SENIORITY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.seniority && <p className="text-xs text-destructive">{errors.seniority.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Controller
            name="stateId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado…" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.uf} — {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.stateId && <p className="text-xs text-destructive">{errors.stateId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Cidade</Label>
          <Controller
            name="cityId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!watchedState || loadingCities}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCities ? 'Carregando…' : 'Cidade…'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.cityId && <p className="text-xs text-destructive">{errors.cityId.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Linguagens
          <span className="ml-1 text-xs text-muted-foreground font-normal">
            (ao menos uma obrigatória)
          </span>
        </Label>

        <ScrollArea className="h-52 rounded-lg border border-border p-3">
          <div className="space-y-4">
            {Object.entries(langsByType).map(([typeLabel, langs]) => (
              <div key={typeLabel}>
                <p className="text-xs font-semibold text-muted-foreground uppercase
                               tracking-wider mb-2">{typeLabel}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {langs.map(lang => {
                    const checked = watchedLangs.includes(lang.id);
                    return (
                      <label
                        key={lang.id}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5
                                    text-sm cursor-pointer transition-colors select-none
                                    ${checked
                                      ? 'bg-primary/10 text-primary'
                                      : 'hover:bg-muted text-foreground'}`}
                      >
                        <Controller
                          name="languageIds"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={checked}
                              onCheckedChange={ch => {
                                if (ch) field.onChange([...field.value, lang.id]);
                                else    field.onChange(field.value.filter((id: string) => id !== lang.id));
                              }}
                            />
                          )}
                        />
                        {lang.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {errors.languageIds && (
          <p className="text-xs text-destructive">{errors.languageIds.message}</p>
        )}

        {watchedLangs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {watchedLangs.map(id => {
              const lang = languages.find(l => l.id === id);
              if (!lang) return null;
              return (
                <Badge key={id} variant="secondary"
                       className="gap-1 cursor-pointer hover:bg-destructive/10"
                       onClick={() => setValue('languageIds', watchedLangs.filter(l => l !== id))}>
                  {lang.name} ×
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={crud.isSubmitting}>
          {crud.isSubmitting ? 'Salvando…' : item ? 'Salvar alterações' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}

// Columns 

const COLUMNS: Column<DeveloperDto>[] = [
  {
    key: 'name', header: 'Desenvolvedor',
    cell: r => (
      <div>
        <p className="font-medium">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.email}</p>
      </div>
    ),
  },
  {
    key: 'seniority', header: 'Senioridade',
    cell: r => <SeniorityBadge value={r.seniority} />,
  },
  {
    key: 'languages',
    header: 'Linguagens',
    cell: r => (
      <div className="flex flex-wrap gap-1 max-w-[220px]">
        {r.languages?.map(lang => (
          <Badge key={lang.id} variant="secondary" className="text-[10px] font-normal">
            {lang.name}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: 'location', header: 'Localização',
    className: 'hidden md:table-cell text-sm text-muted-foreground',
    cell: r => `${r.cityName}, ${r.stateUF}`,
  },
];

// Page

export default function DevelopersPage() {
  const [states,    setStates]    = useState<StateDto[]>([]);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);

  useEffect(() => {
    statesApi.list(1, 100).then(r => setStates(r.items)).catch(() => {});
    languagesApi.list(1, 100).then(r => setLanguages(r.items)).catch(() => {});
  }, []);

  const crudOptions = useMemo(() => ({
    listFn: (f: DeveloperFilters & { page?: number; pageSize?: number }) =>
      developersApi.list(f),
      deleteFn: async (id: unknown) => {
      await developersApi.delete(id as string);
    },
    initialFilters: {
      page: 1,
      pageSize: 10,
    },
    messages: {
      deleted: 'Desenvolvedor excluído com sucesso.',
    },
  }), []);

  const crud = usePagedCrud<DeveloperDto, DeveloperFilters>(crudOptions);

  return (
    <CrudPage
      title="Desenvolvedores"
      description="Gerencie os desenvolvedores da plataforma."
      createLabel="Novo desenvolvedor"
      columns={COLUMNS}
      data={crud.items}
      rowKey={r => r.id}
      isLoading={crud.isLoading}
      isSubmitting={crud.isSubmitting}
      page={crud.filters?.page ?? 1}
      totalPages={crud.totalPages || 1}
      totalCount={crud.total ?? 0}
      onPageChange={p => crud.setFilters({ ...(crud.filters ?? {}), page: p })}
      onDelete={item => crud.remove(item.id)}
      deleteMessage={item => `Deseja excluir o desenvolvedor "${item.name}"?`}
      renderFilters={
        <>
          <Select 
            value={crud.filters?.seniority?.toString() ?? 'all'} 
            onValueChange={v => crud.setFilters({ 
              ...(crud.filters ?? {}), 
              seniority: v === 'all' ? undefined : (Number(v) as Seniority) 
            })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Senioridade…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(SENIORITY_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={crud.filters?.languageId ?? 'all'}
            onValueChange={v => crud.setFilters({ 
              ...(crud.filters ?? {}), 
              languageId: v === 'all' ? undefined : v 
            })}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Linguagem…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as linguagens</SelectItem>
              {languages.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={crud.filters?.cityId ?? 'all'}
            onValueChange={v => crud.setFilters({ 
              ...(crud.filters ?? {}), 
              cityId: v === 'all' ? undefined : v 
            })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {states.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.uf} — {s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
      renderForm={({ item, onClose }) => <DeveloperForm item={item} onClose={onClose} />}
      emptyMessage="Nenhum desenvolvedor cadastrado."
    />
  );
}