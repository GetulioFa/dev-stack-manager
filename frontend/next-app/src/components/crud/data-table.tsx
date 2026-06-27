'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns:     Column<T>[];
  data:        T[];
  isLoading:   boolean;
  page:        number;
  totalPages:  number;
  totalCount:  number;
  onPageChange:(page: number) => void;
  emptyMessage?: string;
  rowKey:      (row: T) => string;
}

export function DataTable<T>({
  columns, data, isLoading, page, totalPages, totalCount,
  onPageChange, emptyMessage = 'Nenhum registro encontrado.', rowKey,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map(col => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}
                           className="text-center text-muted-foreground py-16">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map(row => (
                <TableRow key={rowKey(row)}
                          className="hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{totalCount} registro{totalCount !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-foreground">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
