'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CrudPage } from '@/components/crud/crud-page';
import { Column } from '@/components/crud/data-table';
import { useCrud, handleError } from '@/lib/hooks/use-crud';
import { usersApi } from '@/lib/api/services';
import { userUpdateSchema, UserUpdateFormValues } from '@/lib/schemas';
import { UserDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const CRUD_OPTIONS = {
  listFn:   (f: { page: number; pageSize: number }) =>
    usersApi.list(f.page, f.pageSize),

  deleteFn: (item: unknown) => {
    const user = item as UserDto;
    if (!user?.email) throw new Error('Email do usuário não encontrado.');
    return usersApi.delete(user.email);
  },

  messages: { deleted: 'Usuário excluído com sucesso.' },
};

// Form

function UserForm({ item, onClose, onSaved }: {
  item:    UserDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: { name: item?.name ?? '', email: item?.email ?? '' },
  });

  useEffect(() => {
    reset({ name: item?.name ?? '', email: item?.email ?? '' });
  }, [item, reset]);

  const onSubmit = async (values: UserUpdateFormValues) => {
    if (!item) return;
    setSubmitting(true);
    try {
      await usersApi.update(item.email, values.name, values.email);
      toast.success('Usuário atualizado com sucesso!');
      onSaved();
      onClose();
    } catch (err) {
      handleError(err, 'Erro ao atualizar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-muted-foreground text-sm">
          Novos usuários devem se cadastrar via tela de registro.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="/auth/register" target="_blank" rel="noreferrer">
            Abrir página de registro
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-2">

      <div className="space-y-1.5">
        <Label htmlFor="u-name">Nome</Label>
        <Input
          id="u-name"
          placeholder="Nome completo"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive" role="alert">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="u-email">E-mail</Label>
        <Input
          id="u-email"
          type="email"
          placeholder="voce@email.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}

// Columns

const COLUMNS: Column<UserDto>[] = [
  {
    key: 'name',
    header: 'Usuário',
    cell: r => (
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {r.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'createdAt',
    header: 'Cadastrado em',
    className: 'text-muted-foreground text-sm w-44',
    cell: r => new Date(r.createdAt).toLocaleDateString('pt-BR'),
  },
  {
    key: 'updatedAt',
    header: 'Atualizado em',
    className: 'text-muted-foreground text-sm w-44',
    cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('pt-BR') : '—',
  },
];

// Page

export default function UsersPage() {
  const crud = useCrud<UserDto, { page: number; pageSize: number }>(CRUD_OPTIONS);

  return (
    <CrudPage
      title="Usuários"
      description="Gerencie os usuários do sistema."
      createLabel="Novo usuário"
      columns={COLUMNS}
      data={crud.items}
      rowKey={r => r.id}
      isLoading={crud.isLoading}
      isSubmitting={crud.isSubmitting}
      page={crud.filters.page ?? 1}
      totalPages={crud.totalPages}
      totalCount={crud.total}
      onPageChange={p => crud.setFilters({ page: p })}
      onDelete={item => crud.remove(item)}
      deleteMessage={item => `Deseja excluir o usuário "${item.name}" (${item.email})?`}
      renderForm={({ item, onClose }) => (
        <UserForm item={item} onClose={onClose} onSaved={crud.refresh} />
      )}
      emptyMessage="Nenhum usuário cadastrado."
    />
  );
}
