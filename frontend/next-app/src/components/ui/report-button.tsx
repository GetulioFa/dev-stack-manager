'use client';

import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePdfReport } from '@/lib/hooks/use-pdf-report';
import { DeveloperFilters } from '@/lib/api/services';
import { Seniority, SENIORITY_LABELS } from '@/types';

interface ReportButtonProps {
  activeFilters?: Omit<DeveloperFilters, 'page' | 'pageSize'>;
}

export function ReportButton({ activeFilters = {} }: ReportButtonProps) {
  const { generate, isGenerating } = usePdfReport();

  const hasActiveFilters =
    activeFilters.seniority != null ||
    !!activeFilters.cityId   ||
    !!activeFilters.languageId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isGenerating} className="gap-2">
          {isGenerating
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <FileDown className="h-4 w-4" />}
          {isGenerating ? 'Gerando…' : 'Exportar PDF'}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Escopo do relatório
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => generate({})}
          className="gap-2"
        >
          <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          Todos os desenvolvedores
        </DropdownMenuItem>

        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => generate(activeFilters)}
              className="gap-2"
            >
              <FileDown className="h-4 w-4 shrink-0 text-primary" />
              <span>
                Apenas filtro atual
                {activeFilters.seniority != null && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({SENIORITY_LABELS[activeFilters.seniority as Seniority]})
                  </span>
                )}
              </span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Por senioridade
        </DropdownMenuLabel>

        {Object.entries(SENIORITY_LABELS).map(([val, label]) => (
          <DropdownMenuItem
            key={val}
            onClick={() => generate({ seniority: Number(val) as Seniority })}
            className="gap-2 text-sm"
          >
            <span className="w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
