'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
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

const TIMEZONE_OPTIONS = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'Europe/London', label: 'London' },
];

export default function SettingsPage() {
  const { showToast } = useWuShowToast();
  const [orgName, setOrgName] = useState('Acme Research');
  const [timezone, setTimezone] = useState(TIMEZONE_OPTIONS[0]);

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Settings"
        description="Organization settings for QuestionPro BI"
      />
      <div className="flex flex-col gap-6 border border-gray-200 rounded-lg p-6 bg-white">
        <WuInput
          Label="Organization name"
          variant="outlined"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
        <WuSelect
          data={TIMEZONE_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={timezone}
          onSelect={(v) => setTimezone(v as typeof timezone)}
          Label="Default timezone"
          variant="outlined"
        />
        <WuButton
          onClick={() => showToast({ message: 'Settings saved', variant: 'success' })}
        >
          Save changes
        </WuButton>
      </div>
    </PageContainer>
  );
}
