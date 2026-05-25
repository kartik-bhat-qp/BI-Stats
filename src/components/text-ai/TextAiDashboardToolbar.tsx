'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import {
  TEXT_AI_SUBTOPIC_FILTER_OPTIONS,
  TEXT_AI_TOPIC_FILTER_OPTIONS,
  type TextAiFilterOption,
} from '@/data/mock-text-ai-widget-data';
import styles from './TextAiDashboardToolbar.module.css';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuTooltip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTooltip })),
  { ssr: false }
);

const SETTINGS_TOOLTIP = 'Dashboard settings';

interface TextAiDashboardToolbarProps {
  name: string;
  onNameChange: (name: string) => void;
  onAddWidget?: () => void;
  onOpenSettings?: () => void;
}

export function TextAiDashboardToolbar({
  name,
  onNameChange,
  onAddWidget,
  onOpenSettings,
}: TextAiDashboardToolbarProps) {
  const { showToast } = useWuShowToast();
  const [nameState, setNameState] = useState(name);
  const [topic, setTopic] = useState<TextAiFilterOption>(TEXT_AI_TOPIC_FILTER_OPTIONS[0]);
  const [subtopic, setSubtopic] = useState<TextAiFilterOption>(
    TEXT_AI_SUBTOPIC_FILTER_OPTIONS[0]
  );

  useEffect(() => {
    setNameState(name);
  }, [name]);

  function handleNameBlur(): void {
    const trimmed = nameState.trim();
    if (!trimmed) {
      setNameState(name);
      return;
    }
    if (trimmed !== name) {
      onNameChange(trimmed);
      showToast({
        message: `Dashboard renamed to '${trimmed}'`,
        variant: 'success',
      });
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.titleSection}>
          <input
            type="text"
            value={nameState}
            onChange={(e) => setNameState(e.target.value)}
            onBlur={handleNameBlur}
            className={styles.nameInput}
            maxLength={100}
            aria-label="Dashboard name"
          />
        </div>

        <div className={styles.actions}>
          <WuButton
            variant="iconOnly"
            size="sm"
            aria-label="Filter dashboard"
            onClick={() => showToast({ message: 'Filter', variant: 'success' })}
            Icon={<span className="wm-filter-alt" />}
          />
          <WuButton
            variant="iconOnly"
            size="sm"
            aria-label="Table view"
            onClick={() => showToast({ message: 'Table view', variant: 'success' })}
            Icon={<span className="wm-table-chart" />}
          />
          <WuButton
            variant="iconOnly"
            size="sm"
            aria-label="Share dashboard"
            onClick={() => showToast({ message: 'Share dashboard', variant: 'success' })}
            Icon={<span className="wm-share" />}
          />
          <WuTooltip content={SETTINGS_TOOLTIP} position="bottom">
            <WuButton
              variant="iconOnly"
              size="sm"
              aria-label={SETTINGS_TOOLTIP}
              onClick={() => onOpenSettings?.()}
              Icon={<span className="wm-settings" />}
            />
          </WuTooltip>
          <WuButton onClick={onAddWidget} Icon={<span className="wm-add-2" />}>
            Add widget
          </WuButton>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterField}>
          <span className={styles.filterLabel}>Topic</span>
          <WuSelect
            data={TEXT_AI_TOPIC_FILTER_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={topic}
            onSelect={(option) => {
              if (!option) return;
              setTopic(option as TextAiFilterOption);
            }}
            variant="outlined"
          />
        </div>
        <div className={styles.filterField}>
          <span className={styles.filterLabel}>Sub topic</span>
          <WuSelect
            data={TEXT_AI_SUBTOPIC_FILTER_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={subtopic}
            onSelect={(option) => {
              if (!option) return;
              setSubtopic(option as TextAiFilterOption);
            }}
            variant="outlined"
          />
        </div>
      </div>
    </header>
  );
}
