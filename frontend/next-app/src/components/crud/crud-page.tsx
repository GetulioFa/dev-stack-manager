'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable, Column } from './data-table';

interface CrudPageProps<T> {
  title:        string;
  description?: string;
  createLabel?: string;
  columns:      Column<T>[];
  data:         T[];
  rowKey:       (row: T) => string;
  isLoading:    boolean;
  isSubmitting: boolean;
  page:         number;
  totalPages:   number;
  totalCount:   number;
  onPageChange: (page: number) => void;
  renderForm:   (opts: { item: T | null; onClose: () => void }) => ReactNode;
  renderFilters?: ReactNode;
  onDelete:     (item: T) => Promise<boolean>;
  deleteMessage?: (item: T) => string;
  emptyMessage?:  string;
}

export function CrudPage<T>({
  title, description, createLabel = 'Novo',
  columns, data, rowKey, isLoading, isSubmitting,
  page, totalPages, totalCount, onPageChange,
  renderForm, renderFilters,
  onDelete, deleteMessage, emptyMessage,
}: CrudPageProps<T>) {
  const [formOpen,    setFormOpen]    = useState(false);
  const [editItem,    setEditItem]    = useState<T | null>(null);
  const [deleteItem,  setDeleteItem]  = useState<T | null>(null);
  const [isDeleting,  setDeleting]    = useState(false);

  const closeForm = () => {
    setFormOpen(false);
    setTimeout(() => setEditItem(null), 200);
  };

  const allColumns: Column<T>[] = [
    ...columns,
    {
      key:       '_actions',
      header:    '',
      className: 'w-32 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm"
                  onClick={() => { setEditItem(row); setFormOpen(true); }}>
            Editar
          </Button>
          <Button variant="ghost" size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteItem(row)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    await onDelete(deleteItem);
    setDeleting(false);
    setDeleteItem(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }}
                className="gap-2">
          <Plus className="h-4 w-4" />
          {createLabel}
        </Button>
      </div>

      {renderFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-card border border-border rounded-xl">
          {renderFilters}
        </div>
      )}

      <DataTable
        columns={allColumns}
        data={data}
        rowKey={rowKey}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        emptyMessage={emptyMessage}
      />

      <Dialog
        open={formOpen}
        onOpenChange={open => { if (!open) closeForm(); }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Editar' : 'Novo'}{' '}
              {title.endsWith('es') ? title.slice(0, -2) :
               title.endsWith('s')  ? title.slice(0, -1) : title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulário de {editItem ? 'edição' : 'criação'}
            </DialogDescription>
          </DialogHeader>
          {renderForm({ item: editItem, onClose: closeForm })}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={open => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItem && deleteMessage
                ? deleteMessage(deleteItem)
                : 'Esta ação não pode ser desfeita. Deseja continuar?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Excluindo…' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
