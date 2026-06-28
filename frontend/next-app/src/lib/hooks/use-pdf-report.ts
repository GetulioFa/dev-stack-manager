'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { developersApi, DeveloperFilters } from '@/lib/api/services';
import { DeveloperExportDto, SENIORITY_LABELS, LANGUAGE_TYPE_LABELS } from '@/types';
import { ApiClientError } from '@/lib/api/client';

export function usePdfReport() {
  const [isGenerating, setGenerating] = useState(false);

  const generate = useCallback(
    async (filters: Omit<DeveloperFilters, 'page' | 'pageSize'> = {}) => {
      setGenerating(true);
      const loadingToast = toast.loading('Gerando relatório PDF…');

      try {
        const developers = await developersApi.export(filters);

        if (developers.length === 0) {
          toast.dismiss(loadingToast);
          toast.warning('Nenhum desenvolvedor encontrado para gerar o relatório.');
          return;
        }

        const { default: jsPDF }    = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        // 3. Build the PDF
        const doc          = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const generatedAt  = new Date().toLocaleString('pt-BR');
        const pageWidth    = doc.internal.pageSize.width;
        const pageHeight   = doc.internal.pageSize.height;

        //  Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 297, 22, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DevStackManager', 14, 10);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Relatório de Desenvolvedores', 14, 17);

        // Date on the right
        doc.setFontSize(8);
        doc.text(`Gerado em: ${generatedAt}`, 283, 17, { align: 'right' });

        // Summary bar
        doc.setFillColor(241, 245, 249); 
        doc.rect(0, 22, 297, 10, 'F');

        doc.setTextColor(71, 85, 105);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const juniors = developers.filter(d => d.seniority === 'Junior').length;
        const plenos  = developers.filter(d => d.seniority === 'Pleno').length;
        const seniors = developers.filter(d => d.seniority === 'Senior').length;

        doc.text(`Total: ${developers.length} desenvolvedor${developers.length !== 1 ? 'es' : ''}`, 14, 28);
        doc.text(`Júnior: ${juniors}   Pleno: ${plenos}   Sênior: ${seniors}`, 90, 28);

        // Table 
        const rows = developers.map((dev: DeveloperExportDto, i: number) => [
          String(i + 1),
          dev.name,
          `${dev.city}, ${dev.state}`, 
          dev.seniority,                    
          dev.languages || '—',             
          dev.email,
        ]);

        autoTable(doc, {
          startY: 35,
          head: [['#', 'Nome', 'Localização', 'Senioridade', 'Linguagens', 'E-mail']],
          body: rows,
          theme: 'grid',
          styles: {
            fontSize:    8,
            cellPadding: 3,
            overflow:    'linebreak',
            textColor:   [30, 41, 59],
          },
          headStyles: {
            fillColor:  [99, 102, 241],  
            textColor:  [255, 255, 255],
            fontStyle:  'bold',
            fontSize:   8,
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],  
          },
          columnStyles: {
            0: { cellWidth: 10,  halign: 'center' },  // #
            1: { cellWidth: 55 },                      // Nome
            2: { cellWidth: 45 },                      // Localização
            3: { cellWidth: 25, halign: 'center' },    // Senioridade
            4: { cellWidth: 80 },                      // Linguagens
            5: { cellWidth: 60 },                      // E-mail
          },
          // Footer with page numbers
          didDrawPage: (data) => {
            const pageCount = doc.getNumberOfPages();
            const current   = data.pageNumber;
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text(
              `Página ${current} de ${pageCount}`,
              283,
              doc.internal.pageSize.height - 5,
              { align: 'right' },
            );
            doc.text(
              'DevStackManager — Relatório Confidencial',
              14,
              doc.internal.pageSize.height - 5,
            );
          },
        });

        // 4. Save the file
        const filename = `desenvolvedores_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);

        toast.dismiss(loadingToast);
        toast.success(`Relatório gerado com ${developers.length} desenvolvedor${developers.length !== 1 ? 'es' : ''}!`);
      } catch (err) {
        toast.dismiss(loadingToast);
        if (err instanceof ApiClientError) {
          toast.error(err.detail || 'Erro ao buscar dados para o relatório.');
        } else {
          toast.error('Erro ao gerar o PDF. Tente novamente.');
          console.error('[usePdfReport]', err);
        }
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  return { generate, isGenerating };
}
