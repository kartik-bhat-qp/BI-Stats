'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { TextAiAnalysisRow, TextAiAnalysisWidget } from '@/data/mock-text-ai-widget-data';
import styles from './TextAiAnalysisWidget.module.css';

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
  { ssr: false }
);

const PAGE_SIZE = 100;

interface TextAiAnalysisWidgetProps {
  widget: TextAiAnalysisWidget;
}

function SubtopicPill({
  label,
  tone,
}: {
  label: string;
  tone: TextAiAnalysisRow['subtopicTone'];
}) {
  return (
    <span
      className={`${styles.subtopicPill} ${
        tone === 'positive' ? styles.subtopicPositive : styles.subtopicNeutral
      }`}
    >
      <span
        className={tone === 'positive' ? 'wm-sentiment-satisfied' : 'wm-sentiment-neutral'}
        aria-hidden
      />
      {label}
    </span>
  );
}

export function TextAiAnalysisWidgetCard({ widget }: TextAiAnalysisWidgetProps) {
  const { showToast } = useWuShowToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return widget.rows;
    return widget.rows.filter(
      (row) =>
        row.value.toLowerCase().includes(term) ||
        row.topic.toLowerCase().includes(term) ||
        row.subtopic.toLowerCase().includes(term) ||
        row.insight.toLowerCase().includes(term) ||
        row.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [search, widget.rows]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const rangeStart = filteredRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, filteredRows.length);

  const columns: IWuTableColumnDef<TextAiAnalysisRow>[] = [
    {
      accessorKey: 'value',
      header: 'Value',
      enableSorting: true,
      cell: ({ row }) => <span className={styles.valueCell}>{row.original.value}</span>,
    },
    {
      accessorKey: 'topic',
      header: 'Topics',
      enableSorting: true,
      cell: ({ row }) => <span className={styles.topicCell}>{row.original.topic}</span>,
    },
    {
      accessorKey: 'subtopic',
      header: 'Subtopics',
      enableSorting: true,
      cell: ({ row }) => (
        <SubtopicPill label={row.original.subtopic} tone={row.original.subtopicTone} />
      ),
    },
    {
      accessorKey: 'insight',
      header: 'Insights',
      cell: ({ row }) => <span className={styles.insightCell}>{row.original.insight}</span>,
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <span className={styles.tagsCell}>{row.original.tags.join(', ')}</span>
      ),
    },
  ];

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{widget.question}</h2>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Widget menu"
          onClick={() => showToast({ message: 'Widget menu', variant: 'success' })}
        >
          <span className="wm-more-vert" />
        </button>
      </header>

      <div className={styles.toolbar}>
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
            data={[{ value: '100', label: '100' }]}
            accessorKey={{ value: 'value', label: 'label' }}
            value={{ value: '100', label: '100' }}
            onSelect={() => {}}
            variant="outlined"
            className={styles.pageSizeSelect}
          />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <WuTable
          data={pageRows as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
          sort={{ enabled: true }}
          filterText=""
        />
      </div>
    </article>
  );
}
