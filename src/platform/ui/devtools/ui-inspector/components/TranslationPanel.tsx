'use client';

import { useState } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { SidebarSection } from '../sidebar/SidebarSection';
import { useInspectorContext } from '../state/InspectorProvider';

interface HardcodedTextItem {
  scanKey: string;
  text: string;
  tagName: string;
  hasUuid: boolean;
  uuid?: string;
  hasTranslation: boolean;
  translationKey?: string;
  sourceFile?: string;
  sourceLine?: number;
  sourceColumn: number | undefined;
  domPath: string | undefined;
}

export function TranslationPanel() {
  const { state, handleRefresh } = useInspectorContext();
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // In a real implementation, this would call the hardcoded text discovery API
  // For now, we'll use the elements from the inspector state
  const elementsWithoutTranslation = state.elements.filter(
    (el) => !el.hasUuid || (el.textSnippet && el.textSnippet.length > 0)
  );

  const handleCreateUuidAndTranslation = async (item: HardcodedTextItem) => {
    if (!item.sourceFile || item.sourceLine === undefined) {
      alert('Cannot create UUID: source information not available');
      return;
    }

    try {
      const response = await fetch('/api/ui-inspector/register-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceFile: item.sourceFile,
          sourceLine: item.sourceLine,
          sourceColumn: item.sourceColumn ?? 0,
          tagName: item.tagName,
          domPath: item.domPath ?? '',
          textSnippet: item.text,
          route: state.routePath,
          requestedPurpose: 'translation',
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh to pick up the new UUID
        handleRefresh();
        setTimeout(() => {
          // Request new scan after refresh
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 1000);
        }, 500);
      } else {
        alert(`Failed to create UUID: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating UUID:', error);
      alert('Failed to create UUID. Please try again.');
    }
  };

  const handleIgnore = (scanKey: string) => {
    // In a real implementation, this would mark the item as ignored
    // For now, we just log it
    console.warn('Ignoring translation item:', scanKey);
  };

  const toggleButton = (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant"
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.TITLE.uuid}
    >
      <span>Translation</span>
      <span className="text-xs text-on-surface-variant">{expanded ? '▼' : '▶'}</span>
    </button>
  );

  return (
    <SidebarSection
      toggleButton={toggleButton}
      open={expanded}
      tone="display"
    >
      <div className="px-3 py-2">
        <p className="text-xs text-on-surface-variant">
          Hardcoded text that should be internationalized
        </p>
      </div>

      {isLoading ? (
        <div className="px-3 py-4 text-xs text-on-surface-variant">
          Loading...
        </div>
      ) : elementsWithoutTranslation.length === 0 ? (
        <div className="px-3 py-4 text-xs text-on-surface-variant">
          No hardcoded text detected
        </div>
      ) : (
        <div className="max-h-64 overflow-auto">
          {elementsWithoutTranslation.map((element) => (
            <div
              key={element.scanKey}
              className="border-b border-outline-variant px-3 py-2 last:border-b-0"
            >
              <div className="mb-2 text-sm font-medium text-on-surface">
                {element.textSnippet || 'Unknown text'}
              </div>
              
              <div className="mb-2 space-y-1 text-xs text-on-surface-variant">
                <div>
                  <span className="font-medium">UUID:</span>{' '}
                  {element.hasUuid ? (
                    <span className="text-primary">Yes ({element.uuid})</span>
                  ) : (
                    <span className="text-error">No</span>
                  )}
                </div>
                {element.sourceFile && (
                  <div>
                    <span className="font-medium">Source:</span>{' '}
                    {element.sourceFile}:{element.sourceLine}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!element.hasUuid ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateUuidAndTranslation({
                        scanKey: element.scanKey,
                        text: element.textSnippet || '',
                        tagName: element.tagName,
                        hasUuid: element.hasUuid,
                        uuid: element.uuid,
                        hasTranslation: false,
                        sourceFile: element.sourceFile,
                        sourceLine: element.sourceLine,
                        sourceColumn: element.sourceColumn,
                        domPath: element.domPath,
                      })
                    }
                    className="rounded border border-primary bg-primary px-2 py-1 text-xs font-medium text-on-primary hover:bg-primary/90"
                  >
                    Create UUID + Translation
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateUuidAndTranslation({
                        scanKey: element.scanKey,
                        text: element.textSnippet || '',
                        tagName: element.tagName,
                        hasUuid: element.hasUuid,
                        uuid: element.uuid,
                        hasTranslation: false,
                        sourceFile: element.sourceFile,
                        sourceLine: element.sourceLine,
                        sourceColumn: element.sourceColumn,
                        domPath: element.domPath,
                      })
                    }
                    className="rounded border border-primary bg-primary px-2 py-1 text-xs font-medium text-on-primary hover:bg-primary/90"
                  >
                    Create Translation
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleIgnore(element.scanKey)}
                  className="rounded border border-outline px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-variant"
                >
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SidebarSection>
  );
}
