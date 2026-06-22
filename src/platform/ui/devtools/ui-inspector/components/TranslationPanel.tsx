'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { SidebarSection } from '../sidebar/SidebarSection';
import { useInspectorContext } from '../state/InspectorProvider';

interface CheckTranslationItem {
  key: string;
  route: string;
  scanKey: string;
  textSnippet: string;
  tagName: string;
  uuid: string;
  sourceFile: string;
  sourceLine: number;
  sourceColumn: number;
  domPath: string;
  reason: 'hardcoded-text' | 'lang-uuid-incomplete';
}

interface IgnoreRecord {
  key: string;
  route: string;
  sourceFile: string;
  sourceLine: number;
  sourceColumn: number;
  tagName: string;
  domPath: string;
  textSnippet: string;
  ignoredAt: string;
}

export function TranslationPanel() {
  const { state, handleRefresh, sendHighlight, sendClearHighlight, sendScroll } = useInspectorContext();
  const [checkOpen, setCheckOpen] = useState(true);
  const [ignoredOpen, setIgnoredOpen] = useState(false);
  const [ignoredRecords, setIgnoredRecords] = useState<Record<string, IgnoreRecord>>({});
  const [statusText, setStatusText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [framedKey, setFramedKey] = useState<string | null>(null);

  const loadIgnored = useCallback(async () => {
    try {
      const response = await fetch('/api/ui-inspector/translation-ignore', { cache: 'no-store' });
      if (!response.ok) return;
      const data = (await response.json()) as { records?: Record<string, IgnoreRecord> };
      setIgnoredRecords(data.records ?? {});
    } catch {
      /* devtools persistence is best-effort */
    }
  }, []);

  useEffect(() => {
    void loadIgnored();
  }, [loadIgnored, state.iframeKey, state.routePath]);

  const ignoredKeys = useMemo(() => new Set(Object.keys(ignoredRecords)), [ignoredRecords]);

  const checkItems = useMemo<CheckTranslationItem[]>(() => {
    return state.elements
      .map((element) => {
        const textSnippet = element.textSnippet?.trim() ?? '';
        const uuid = element.uuid?.trim() ?? '';
        const hasHardcodedText = textSnippet.length > 0;
        const hasIncompleteLangUuid = uuid.startsWith('lang-');
        if (!hasHardcodedText && !hasIncompleteLangUuid) return null;

        const item: CheckTranslationItem = {
          key: createTranslationItemKey(state.routePath, {
            sourceFile: element.sourceFile ?? '',
            sourceLine: element.sourceLine ?? 0,
            sourceColumn: element.sourceColumn ?? 0,
            tagName: element.tagName,
            domPath: element.domPath ?? '',
            textSnippet,
          }),
          route: state.routePath,
          scanKey: element.scanKey,
          textSnippet,
          tagName: element.tagName,
          uuid,
          sourceFile: element.sourceFile ?? '',
          sourceLine: element.sourceLine ?? 0,
          sourceColumn: element.sourceColumn ?? 0,
          domPath: element.domPath ?? '',
          reason: hasHardcodedText ? 'hardcoded-text' : 'lang-uuid-incomplete',
        };

        return ignoredKeys.has(item.key) ? null : item;
      })
      .filter((item): item is CheckTranslationItem => Boolean(item));
  }, [ignoredKeys, state.elements, state.routePath]);

  const scanKeyByItemKey = useMemo(() => {
    const index = new Map<string, string>();
    for (const element of state.elements) {
      const textSnippet = element.textSnippet?.trim() ?? '';
      const key = createTranslationItemKey(state.routePath, {
        sourceFile: element.sourceFile ?? '',
        sourceLine: element.sourceLine ?? 0,
        sourceColumn: element.sourceColumn ?? 0,
        tagName: element.tagName,
        domPath: element.domPath ?? '',
        textSnippet,
      });
      index.set(key, element.scanKey);
    }
    return index;
  }, [state.elements, state.routePath]);

  useEffect(() => {
    setFramedKey(null);
    sendClearHighlight();
  }, [sendClearHighlight, state.iframeKey, state.routePath]);

  const handlePanelRefresh = async () => {
    setStatusText('Refreshing...');
    handleRefresh();
    await loadIgnored();
    setStatusText('Refreshed');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusText('Saving...');
    try {
      const response = await fetch('/api/ui-inspector/check-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: checkItems }),
      });
      if (!response.ok) throw new Error('save failed');
      setStatusText(`Saved ${checkItems.length} item${checkItems.length === 1 ? '' : 's'}`);
    } catch {
      setStatusText('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleIgnore = async (item: CheckTranslationItem) => {
    const previous = ignoredRecords;
    const optimistic: IgnoreRecord = {
      key: item.key,
      route: item.route,
      sourceFile: item.sourceFile,
      sourceLine: item.sourceLine,
      sourceColumn: item.sourceColumn,
      tagName: item.tagName,
      domPath: item.domPath,
      textSnippet: item.textSnippet,
      ignoredAt: new Date().toISOString(),
    };
    setIgnoredRecords((current) => ({ ...current, [item.key]: optimistic }));

    try {
      const response = await fetch('/api/ui-inspector/translation-ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimistic),
      });
      if (!response.ok) throw new Error('ignore failed');
      const data = (await response.json()) as { records?: Record<string, IgnoreRecord> };
      setIgnoredRecords(data.records ?? { ...previous, [item.key]: optimistic });
      setStatusText('Ignored');
    } catch {
      setIgnoredRecords(previous);
      setStatusText('Ignore failed');
    }
  };

  const handleReturn = async (key: string) => {
    const previous = ignoredRecords;
    setIgnoredRecords((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

    try {
      const response = await fetch('/api/ui-inspector/translation-ignore', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (!response.ok) throw new Error('return failed');
      const data = (await response.json()) as { records?: Record<string, IgnoreRecord> };
      setIgnoredRecords(data.records ?? {});
      setStatusText('Returned');
    } catch {
      setIgnoredRecords(previous);
      setStatusText('Return failed');
    }
  };

  const handleToggleFrame = (key: string, scanKey: string | undefined) => {
    if (framedKey === key) {
      sendClearHighlight();
      setFramedKey(null);
      return;
    }

    if (!scanKey) {
      setStatusText('Element is not visible in current page');
      return;
    }

    sendScroll(scanKey);
    sendHighlight(scanKey);
    setFramedKey(key);
  };

  return (
    <>
      <SidebarSection
        toggleButton={
          <PanelToggle
            label="check translat"
            count={checkItems.length}
            open={checkOpen}
            onClick={() => setCheckOpen((value) => !value)}
          />
        }
        open={checkOpen}
        tone="display"
      >
        <div className="flex items-center gap-2 border-b border-outline-variant px-3 py-2">
          <button
            type="button"
            onClick={handlePanelRefresh}
            className="rounded border border-outline px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-variant"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded border border-primary bg-primary px-2 py-1 text-xs font-medium text-on-primary hover:bg-primary/90 disabled:opacity-60"
          >
            Save
          </button>
          {statusText && <span className="truncate text-xs text-on-surface-variant">{statusText}</span>}
        </div>

        {checkItems.length === 0 ? (
          <div className="px-3 py-4 text-xs text-on-surface-variant">No translation checks</div>
        ) : (
          <div className="max-h-72 overflow-auto">
            {checkItems.map((item) => (
              <TranslationListItem
                key={item.key}
                label={item.textSnippet || item.uuid || item.tagName}
                meta={formatItemMeta(item)}
                actionLabel="Ignore"
                frameActive={framedKey === item.key}
                onFrame={() => handleToggleFrame(item.key, item.scanKey)}
                onAction={() => handleIgnore(item)}
              />
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection
        toggleButton={
          <PanelToggle
            label="ignored"
            count={Object.keys(ignoredRecords).length}
            open={ignoredOpen}
            onClick={() => setIgnoredOpen((value) => !value)}
          />
        }
        open={ignoredOpen}
        tone="display"
      >
        {Object.keys(ignoredRecords).length === 0 ? (
          <div className="px-3 py-4 text-xs text-on-surface-variant">No ignored items</div>
        ) : (
          <div className="max-h-72 overflow-auto">
            {Object.values(ignoredRecords).map((item) => (
              <TranslationListItem
                key={item.key}
                label={item.textSnippet || item.tagName}
                meta={`${item.route} - ${item.sourceFile || item.domPath || item.tagName}`}
                actionLabel="Return"
                frameActive={framedKey === item.key}
                onFrame={() => handleToggleFrame(item.key, scanKeyByItemKey.get(item.key))}
                onAction={() => handleReturn(item.key)}
              />
            ))}
          </div>
        )}
      </SidebarSection>
    </>
  );
}

function PanelToggle(props: {
  label: string;
  count: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant"
    >
      <span>{props.label}</span>
      <span className="text-xs text-on-surface-variant">
        {props.count} {props.open ? 'v' : '>'}
      </span>
    </button>
  );
}

function TranslationListItem(props: {
  label: string;
  meta: string;
  actionLabel: string;
  frameActive: boolean;
  onFrame: () => void;
  onAction: () => void;
}) {
  return (
    <div className="border-b border-outline-variant px-3 py-2 last:border-b-0">
      <div className="mb-1 break-words text-sm font-medium text-on-surface">{props.label}</div>
      <div className="mb-2 break-words text-xs text-on-surface-variant">{props.meta}</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={props.onFrame}
          className={
            props.frameActive
              ? 'rounded border border-primary bg-primary px-2 py-1 text-xs font-medium text-on-primary hover:bg-primary/90'
              : 'rounded border border-outline px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-variant'
          }
        >
          Frame
        </button>
        <button
          type="button"
          onClick={props.onAction}
          className="rounded border border-outline px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-variant"
        >
          {props.actionLabel}
        </button>
      </div>
    </div>
  );
}

function formatItemMeta(item: CheckTranslationItem): string {
  const source = item.sourceFile ? `${item.sourceFile}:${item.sourceLine}` : item.domPath || item.tagName;
  const uuid = item.uuid ? `uuid ${item.uuid}` : 'no uuid';
  return `${item.reason} - ${uuid} - ${source}`;
}

function createTranslationItemKey(
  route: string,
  item: {
    sourceFile: string;
    sourceLine: number;
    sourceColumn: number;
    tagName: string;
    domPath: string;
    textSnippet: string;
  }
): string {
  return [
    route,
    item.sourceFile.replace(/\\/g, '/'),
    item.sourceLine,
    item.sourceColumn,
    item.tagName,
    item.domPath,
    item.textSnippet.trim(),
  ].join('|');
}
