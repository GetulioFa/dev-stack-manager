'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CrudPage } from '@/components/crud/crud-page';
import { Column } from '@/components/crud/data-table';
import { useCrud, handleError } from '@/lib/hooks/use-crud';
import {
  developersApi, statesApi, citiesApi, languagesApi,
  DeveloperFilters, DeveloperPayload,
} from '@/lib/api/services';
import { developerSchema, DeveloperFormValues } from '@/lib/schemas';
import {
  DeveloperDto, StateDto, CityDto, LanguageDto,
  Seniority, SENIORITY_LABELS,
  LanguageType, LANGUAGE_TYPE_LABELS,
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
import { ReportButton } from '@/components/ui/report-button';

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

// Language type badge

const TYPE_CLS: Record<LanguageType, string> = {
  [LanguageType.FrontEnd]: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  [LanguageType.BackEnd]:  'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  [LanguageType.Mobile]:   'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  [LanguageType.Database]: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  [LanguageType.DevOps]:   'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
};

// Developer Form

function DeveloperForm({ item, onClose, onSaved, allLanguages, allStates }: {
  item:         DeveloperDto | null;
  onClose:      () => void;
  onSaved:      () => void;
  allLanguages: LanguageDto[];
  allStates:    StateDto[];
}) {
  const [cities,        setCities]        = useState<CityDto[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  
  const isInitialLoad = useRef(true);

  const {
    register, handleSubmit, reset, control, watch, setValue,
    formState: { errors },
  } = useForm<DeveloperFormValues>({
    resolver: zodResolver(developerSchema),
    defaultValues: {
      name:        '',
      email:       '',
      seniority:   '' as unknown as Seniority,
      stateId:     '',
      cityId:      '',
      languageIds: [],
    },
  });

  const watchedStateId = watch('stateId');
  const watchedLangIds = watch('languageIds');

  useEffect(() => {
    if (!watchedStateId) {
      setCities([]);
      if (!isInitialLoad.current) setValue('cityId', '');
      return;
    }
    setLoadingCities(true);
    citiesApi.list(1, 200, watchedStateId)
      .then(r => {
        setCities(r.items);
        setLoadingCities(false);
      })
      .catch(() => setLoadingCities(false));
  }, [watchedStateId, setValue]);

  useEffect(() => {
    if (!item) {
      reset({
        name: '', email: '',
        seniority: '' as unknown as Seniority,
        stateId: '', cityId: '', languageIds: [],
      });
      isInitialLoad.current = true;
      return;
    }

    const state = allStates.find(s => s.uf === item.stateUF);
    if (!state) return;

    isInitialLoad.current = true;
    
    reset({
      name:        item.name,
      email:       item.email,
      seniority:   item.seniority,
      stateId:     state.id,
      cityId:      '',            
      languageIds: item.languages.map(l => l.id),
    });

    
    setLoadingCities(true);
    citiesApi.list(1, 200, state.id).then(r => {
      setCities(r.items);
      setLoadingCities(false);
      setValue('cityId', item.cityId, { shouldValidate: false });
     
      isInitialLoad.current = false;
    });
  }, [item, allStates, reset, setValue]);

  // Submit
  const onSubmit = async (values: DeveloperFormValues) => {
    setSubmitting(true);
    try {
      
      const payload: DeveloperPayload = {
        name:        values.name,
        email:       values.email,
        seniority:   Number(values.seniority) as Seniority,
        cityId:      values.cityId,
        languageIds: values.languageIds,
      };

      if (item) {
        await developersApi.update(item.id, payload);
        toast.success('Desenvolvedor atualizado!');
      } else {
        await developersApi.create(payload);
        toast.success('Desenvolvedor cadastrado!');
      }
      onSaved();
      onClose();
    } catch (err) {
      handleError(err, 'Erro ao salvar desenvolvedor.');
    } finally {
      setSubmitting(false);
    }
  };

  const langsByType = allLanguages.reduce<Record<string, LanguageDto[]>>((acc, lang) => {
    const label = LANGUAGE_TYPE_LABELS[lang.type];
    acc[label] = [...(acc[label] ?? []), lang];
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-2">

      <div className="space-y-1.5">
        <Label htmlFor="d-name">Nome completo</Label>
        <Input
          id="d-name"
          placeholder="Nome do desenvolvedor"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive" role="alert">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="d-email">E-mail</Label>
        <Input
          id="d-email"
          type="email"
          placeholder="dev@email.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
        )}
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
              <SelectTrigger aria-invalid={!!errors.seniority}>
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SENIORITY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.seniority && (
          <p className="text-xs text-destructive" role="alert">{errors.seniority.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Controller
            name="stateId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={v => {
                field.onChange(v);
                if (!isInitialLoad.current) setValue('cityId', '');
              }}>
                <SelectTrigger aria-invalid={!!errors.stateId}>
                  <SelectValue placeholder="Estado…" />
                </SelectTrigger>
                <SelectContent>
                  {allStates.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.uf} — {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.stateId && (
            <p className="text-xs text-destructive" role="alert">{errors.stateId.message}</p>
          )}
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
                disabled={!watchedStateId || loadingCities}
              >
                <SelectTrigger aria-invalid={!!errors.cityId}>
                  <SelectValue
                    placeholder={loadingCities ? 'Carregando…' : 'Cidade…'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.cityId && (
            <p className="text-xs text-destructive" role="alert">{errors.cityId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Linguagens
          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
            (ao menos uma obrigatória)
          </span>
        </Label>

        <ScrollArea className="h-52 rounded-lg border border-border p-3 bg-muted/20">
          <div className="space-y-4">
            {Object.entries(langsByType).map(([typeLabel, langs]) => (
              <div key={typeLabel}>
                <p className="text-xs font-semibold text-muted-foreground uppercase
                               tracking-wider mb-1.5">{typeLabel}</p>
                <div className="grid grid-cols-2 gap-1">
                  {langs.map(lang => {
                    const checked = watchedLangIds.includes(lang.id);
                    return (
                      <Controller
                        key={lang.id}
                        name="languageIds"
                        control={control}
                        render={({ field }) => (
                          <label
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5
                                        text-sm cursor-pointer transition-colors select-none
                                        ${checked
                                          ? 'bg-primary/10 text-primary'
                                          : 'hover:bg-muted text-foreground'}`}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={ch => {
                                const next = ch
                                  ? [...field.value, lang.id]
                                  : field.value.filter((id: string) => id !== lang.id);
                                field.onChange(next);
                              }}
                              className="shrink-0"
                            />
                            <span className="truncate">{lang.name}</span>
                            <span className={`ml-auto shrink-0 inline-flex items-center
                                             rounded-full px-1.5 py-0.5 text-[10px] font-medium
                                             ${TYPE_CLS[lang.type]}`}>
                              {LANGUAGE_TYPE_LABELS[lang.type].slice(0, 3)}
                            </span>
                          </label>
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {errors.languageIds && (
          <p className="text-xs text-destructive" role="alert">
            {errors.languageIds.message}
          </p>
        )}

        {watchedLangIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {watchedLangIds.map(id => {
              const lang = allLanguages.find(l => l.id === id);
              if (!lang) return null;
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="gap-1.5 cursor-pointer hover:bg-destructive/10
                             hover:text-destructive transition-colors"
                  onClick={() => setValue(
                    'languageIds',
                    watchedLangIds.filter(l => l !== id),
                    { shouldValidate: true },
                  )}
                >
                  {lang.name}
                  <span aria-hidden>×</span>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2
                                 border-current border-t-transparent" />
                Salvando…
              </span>
            : item ? 'Salvar alterações' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}

// Table columns

const COLUMNS: Column<DeveloperDto>[] = [
  {
    key: 'name', header: 'Desenvolvedor',
    cell: r => (
      <div>
        <p className="font-medium text-foreground">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.email}</p>
      </div>
    ),
  },
  {
    key: 'seniority', header: 'Senioridade',
    cell: r => <SeniorityBadge value={r.seniority} />,
  },
  {
    key: 'location', header: 'Localização',
    className: 'hidden md:table-cell text-sm text-muted-foreground',
    cell: r => `${r.cityName}, ${r.stateUF}`,
  },
  {
    key: 'languages', header: 'Linguagens',
    className: 'hidden lg:table-cell',
    cell: r => (
      <div className="flex flex-wrap gap-1">
        {r.languages.slice(0, 3).map(l => (
          <Badge key={l.id} variant="outline" className="text-xs font-normal">
            {l.name}
          </Badge>
        ))}
        {r.languages.length > 3 && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            +{r.languages.length - 3}
          </Badge>
        )}
      </div>
    ),
  },
];

// Page

export default function DevelopersPage() {
  const [allStates,    setAllStates]    = useState<StateDto[]>([]);
  const [allLanguages, setAllLanguages] = useState<LanguageDto[]>([]);

  useEffect(() => {
    statesApi.list(1, 200).then(r => setAllStates(r.items)).catch(() => {});
    languagesApi.list(1, 200).then(r => setAllLanguages(r.items)).catch(() => {});
  }, []);

  const [activeFilters, setActiveFilters] = useState<Omit<DeveloperFilters, 'page' | 'pageSize'>>({});

  const crud = useCrud<DeveloperDto, DeveloperFilters & { page: number; pageSize: number }>({
    listFn:   f => developersApi.list(f),
    deleteFn: (id: unknown) => developersApi.delete(id as string),
    messages: { deleted: 'Desenvolvedor excluído.' },
    initialFilters: { page: 1, pageSize: 10 },
  });

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
      page={crud.filters.page ?? 1}
      totalPages={crud.totalPages}
      totalCount={crud.total}
      onPageChange={p => crud.setFilters({ page: p })}
      onDelete={item => crud.remove(item.id)}
      deleteMessage={item =>
        `Deseja excluir o desenvolvedor "${item.name}"? Esta ação não pode ser desfeita.`
      }
      extraHeaderActions={<ReportButton activeFilters={activeFilters} />}
      renderFilters={
        <>
          <Select onValueChange={v => {
            const seniority = v === '__all' ? undefined : Number(v) as Seniority;
            crud.setFilters({ seniority });
            setActiveFilters(prev => ({ ...prev, seniority }));
          }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Senioridade…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas as senioridades</SelectItem>
              {Object.entries(SENIORITY_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={v => {
            const languageId = v === '__all' ? undefined : v;
            crud.setFilters({ languageId });
            setActiveFilters(prev => ({ ...prev, languageId }));
          }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Linguagem…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas as linguagens</SelectItem>
              {allLanguages.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={v =>
            crud.setFilters({ cityId: v === '__all' ? undefined : v })
          }>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todos os estados</SelectItem>
              {allStates.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.uf} — {s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
      renderForm={({ item, onClose }) => (
        <DeveloperForm
          item={item}
          onClose={onClose}
          onSaved={crud.refresh}
          allLanguages={allLanguages}
          allStates={allStates}
        />
      )}
      emptyMessage="Nenhum desenvolvedor cadastrado."
    />
  );
}
