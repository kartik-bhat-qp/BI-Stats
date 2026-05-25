'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import { StandardLoader } from '@/components/ui/StandardLoader';
import {
  MOCK_TEXT_AI_ANALYSIS_QUESTIONS,
  TEXT_AI_QUESTION_CONTEXT_EMPTY,
  type TextAiAnalysisQuestion,
} from '@/data/mock-text-ai-questions';
import { truncate } from '@/data/mock-utils';
import styles from './TextAiQuestionSelection.module.css';

const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false, loading: () => <StandardLoader className="min-h-[200px]" /> }
);

const PAGE_SIZE = 5;

interface TextAiQuestionSelectionProps {
  selectedQuestionIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export function TextAiQuestionSelection({
  selectedQuestionIds,
  onSelectionChange,
}: TextAiQuestionSelectionProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MOCK_TEXT_AI_ANALYSIS_QUESTIONS;
    return MOCK_TEXT_AI_ANALYSIS_QUESTIONS.filter(
      (q) =>
        q.code.toLowerCase().includes(term) || q.text.toLowerCase().includes(term)
    );
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageQuestions = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, safePage]);

  const rangeStart = filteredQuestions.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, filteredQuestions.length);
  const totalCount = MOCK_TEXT_AI_ANALYSIS_QUESTIONS.length;
  const selectedCount = selectedQuestionIds.length;

  function toggleQuestion(id: number, checked: boolean): void {
    onSelectionChange(
      checked
        ? [...selectedQuestionIds, id]
        : selectedQuestionIds.filter((qid) => qid !== id)
    );
  }

  function togglePageAll(checked: boolean): void {
    const pageIds = pageQuestions.map((q) => q.id);
    if (checked) {
      const merged = new Set([...selectedQuestionIds, ...pageIds]);
      onSelectionChange([...merged]);
      return;
    }
    onSelectionChange(selectedQuestionIds.filter((id) => !pageIds.includes(id)));
  }

  const allPageSelected =
    pageQuestions.length > 0 && pageQuestions.every((q) => selectedQuestionIds.includes(q.id));
  const somePageSelected =
    pageQuestions.some((q) => selectedQuestionIds.includes(q.id)) && !allPageSelected;

  const columns: IWuTableColumnDef<TextAiAnalysisQuestion>[] = [
    {
      id: 'select',
      header: () => (
        <div className={styles.checkboxHeader}>
          <WuCheckbox
            checked={allPageSelected}
            indeterminate={somePageSelected}
            onChange={togglePageAll}
            aria-label="Select all questions on this page"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className={styles.checkboxCell}>
          <WuCheckbox
            checked={selectedQuestionIds.includes(row.original.id)}
            onChange={(checked) => toggleQuestion(row.original.id, checked)}
            aria-label={`Select ${row.original.code}`}
          />
        </div>
      ),
      size: 48,
    },
    {
      accessorKey: 'code',
      header: 'Code',
      enableSorting: true,
      cell: ({ row }) => <span className={styles.codeCell}>{row.original.code}</span>,
    },
    {
      accessorKey: 'text',
      header: 'Questions',
      enableSorting: true,
      cell: ({ row }) => (
        <span className={styles.questionCell} title={row.original.text}>
          {truncate(row.original.text, 52)}
        </span>
      ),
    },
    {
      accessorKey: 'context',
      header: 'Context',
      cell: ({ row }) => (
        <span
          className={
            row.original.context ? styles.contextProvided : styles.contextEmpty
          }
        >
          {row.original.context ?? TEXT_AI_QUESTION_CONTEXT_EMPTY}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.root}>
      <p className={styles.heading}>Select questions for text analysis:</p>

      <div className={styles.searchRow}>
        <WuInput
          variant="outlined"
          placeholder="Search"
          Icon={<span className="wm-search" />}
          iconPosition="left"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.metaRow}>
        <span className={styles.selectedCount}>
          Questions selected: {selectedCount}/{totalCount}
        </span>
        <div className={styles.paginationBar}>
          <button
            type="button"
            className={styles.pageNavBtn}
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <span className="wm-chevron-left" />
          </button>
          <span className={styles.pageRange}>
            {rangeStart} - {rangeEnd || PAGE_SIZE}
          </span>
          <button
            type="button"
            className={styles.pageNavBtn}
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            aria-label="Next page"
          >
            <span className="wm-chevron-right" />
          </button>
          <WuSelect
            data={[{ value: '5', label: '5' }]}
            accessorKey={{ value: 'value', label: 'label' }}
            value={{ value: '5', label: '5' }}
            onSelect={() => {}}
            variant="outlined"
            className={styles.pageSizeSelect}
          />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <WuTable
          data={pageQuestions as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
          sort={{ enabled: true }}
          filterText=""
        />
      </div>
    </div>
  );
}
