'use client';

/**
 * DevUiOverlay — Developer Visual Inspector
 *
 * 🔓 Always visible and active in development mode!
 * Activated with Ctrl+Shift+U (but stays visible across screen sizes).
 *
 * Renders colored frames around all [data-ui-id] elements:
 *   - Blue:   valid, active identity
 *   - Amber:  deprecated identity
 *   - Red:    unknown / unregistered element
 *
 * Features:
 *   - Floating tooltip shows Stable ID, path, feature, version, and source file
 *   - Database section: Toggle ON/OFF to add inf1/inf2/inf3 fields
 *   - Attributes section: Toggle ON/OFF to add Attribute1/Attribute2/Attribute3 checkboxes
 *   - MAOL Toggle: Turn MAOL (Minimal Agent Observability Layer) ON/OFF
 *
 * This component is tree-shaken from production builds via process.env check.
 *
 * @see docs/SERVER_ARCHITECTURE.md for complete documentation
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UI_ID_MAP } from '@/shared/ui-registry';
import { UI_SOURCE_INDEX } from '@/shared/ui-source-index';
import { useMaolStore } from '@/store/index';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  id: string;
  path: string;
  feature: string;
  version: string;
  deprecated: boolean;
  sourceFile: string;
  sourceComponent: string;
  sourceLine: number;
  // New fields for database & attributes
  databaseEnabled: boolean;
  inf1: string;
  inf2: string;
  inf3: string;
  attributesEnabled: boolean;
  attribute1: boolean;
  attribute2: boolean;
  attribute3: boolean;
  // New fields for data-ui-path and data-ui-feature
  dataUiPath: string;
  dataUiFeature: string;
}

interface OverlayFrame {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  color: 'blue' | 'amber' | 'red';
  label: string;
}

const STORAGE_KEY = 'dev-ui-overlay-active';

function computeFrames(): OverlayFrame[] {
  const elements = document.querySelectorAll<HTMLElement>('[data-ui-id]');
  const frames: OverlayFrame[] = [];

  elements.forEach((el) => {
    const id = el.getAttribute('data-ui-id') || '';
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const identity = UI_ID_MAP[id];
    let color: 'blue' | 'amber' | 'red' = 'red';
    let label = id || '?';

    if (identity) {
      color = identity.deprecated ? 'amber' : 'blue';
      label = identity.id;
    }

    frames.push({
      id,
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
      color,
      label,
    });
  });

  return frames;
}

const COLOR_MAP = {
  blue: { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)', badge: '#2563eb' },
  amber: { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', badge: '#d97706' },
  red: { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', badge: '#dc2626' },
};

export function DevUiOverlay() {
  // Always default to active!
  const [active, setActive] = useState<boolean>(true);
  const isMaolEnabled = useMaolStore((state) => state.isEnabled);
  const toggleMaol = useMaolStore((state) => state.toggleMaol);

  const [frames, setFrames] = useState<OverlayFrame[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0, y: 0,
    id: '', path: '', feature: '', version: '',
    deprecated: false,
    sourceFile: '', sourceComponent: '', sourceLine: 0,
    databaseEnabled: false,
    inf1: '',
    inf2: '',
    inf3: '',
    attributesEnabled: false,
    attribute1: false,
    attribute2: false,
    attribute3: false,
    dataUiPath: '',
    dataUiFeature: '',
  });

  const [allInspectorData, setAllInspectorData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const rafRef = useRef<number | null>(null);

  // Load all inspector data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/ui-inspector');
        if (response.ok) {
          const data = await response.json();
          setAllInspectorData(data);
        }
      } catch (error) {
        console.error('Failed to load inspector data:', error);
      }
    };
    loadData();
  }, []);

  const refresh = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setFrames(computeFrames());
    });
  }, []);

  // Keyboard toggle: Ctrl+Shift+U
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        setActive((prev) => {
          const next = !prev;
          try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Refresh frames on scroll/resize/mutation when active
  useEffect(() => {
    if (!active) { setFrames([]); return; }

    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, refresh]);

  const handleFrameClick = useCallback((e: React.MouseEvent, frame: OverlayFrame) => {
    e.stopPropagation();
    const identity = UI_ID_MAP[frame.id];
    const source = UI_SOURCE_INDEX[frame.id];

    // Load saved data from our API data first, fallback to defaults
    const savedData = allInspectorData[frame.id];
    
    setTooltip({
      visible: true,
      x: e.clientX + 12,
      y: e.clientY + 12,
      id: frame.id,
      path: identity?.path || '—',
      feature: identity?.feature || '—',
      version: identity?.version || '—',
      deprecated: identity?.deprecated ?? false,
      sourceFile: source?.sourceFile || '—',
      sourceComponent: source?.sourceComponent || '—',
      sourceLine: source?.sourceLine || 0,
      databaseEnabled: savedData?.databaseEnabled ?? false,
      inf1: savedData?.inf1 || '',
      inf2: savedData?.inf2 || '',
      inf3: savedData?.inf3 || '',
      attributesEnabled: savedData?.attributesEnabled ?? false,
      attribute1: savedData?.attribute1 ?? false,
      attribute2: savedData?.attribute2 ?? false,
      attribute3: savedData?.attribute3 ?? false,
      dataUiPath: savedData?.dataUiPath || identity?.path || '',
      dataUiFeature: savedData?.dataUiFeature || identity?.feature || '',
    });
  }, [allInspectorData]);

  const dismissTooltip = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  const handleSave = async () => {
    if (!tooltip.id) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const response = await fetch('/api/ui-inspector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uiId: tooltip.id,
          databaseEnabled: tooltip.databaseEnabled,
          inf1: tooltip.inf1,
          inf2: tooltip.inf2,
          inf3: tooltip.inf3,
          attributesEnabled: tooltip.attributesEnabled,
          attribute1: tooltip.attribute1,
          attribute2: tooltip.attribute2,
          attribute3: tooltip.attribute3,
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        // Update our local data
        setAllInspectorData(prev => ({
          ...prev,
          [tooltip.id]: {
            databaseEnabled: tooltip.databaseEnabled,
            inf1: tooltip.inf1,
            inf2: tooltip.inf2,
            inf3: tooltip.inf3,
            attributesEnabled: tooltip.attributesEnabled,
            attribute1: tooltip.attribute1,
            attribute2: tooltip.attribute2,
            attribute3: tooltip.attribute3,
          }
        }));
        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!active && frames.length === 0) {
    return (
      <button
        aria-label="Toggle UI Identity Overlay (Ctrl+Shift+U)"
        title="Toggle UI Identity Overlay (Ctrl+Shift+U)"
        onClick={() => setActive(true)}
        style={{
          position: 'fixed',
          bottom: '72px',
          right: '12px',
          zIndex: 99990,
          background: '#1e293b',
          color: '#94a3b8',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          opacity: 0.6,
        }}
      >
        UI Inspector
      </button>
    );
  }

  return (
    <>
      {/* Control bar - Always visible, works across all screen sizes */}
      <div
        style={{
          position: 'fixed',
          bottom: '72px',
          right: '12px',
          zIndex: 99999,
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '10px',
          padding: '6px 10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#94a3b8',
        }}
      >
        <span style={{ color: '#3b82f6', fontWeight: 700 }}>UI Inspector</span>
        <span>|</span>
        <span style={{ color: '#22c55e' }}>{frames.filter(f => f.color === 'blue').length} ok</span>
        <span style={{ color: '#f59e0b' }}>{frames.filter(f => f.color === 'amber').length} dep</span>
        <span style={{ color: '#ef4444' }}>{frames.filter(f => f.color === 'red').length} err</span>
        <span>|</span>
        {/* MAOL Toggle - Toggle MAOL ON/OFF directly from here */}
        <button
          onClick={toggleMaol}
          style={{
            padding: '2px 8px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 600,
            background: isMaolEnabled ? '#22c55e' : '#475569',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          MAOL {isMaolEnabled ? 'ON' : 'OFF'}
        </button>
        <span>|</span>
        <button
          onClick={() => {
            setActive(false);
            setTooltip(t => ({ ...t, visible: false }));
            try { localStorage.setItem(STORAGE_KEY, 'false'); } catch { /* noop */ }
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '0 2px',
          }}
          aria-label="Close UI Inspector"
          title="Close (Ctrl+Shift+U)"
        >
          ✕
        </button>
      </div>

      {/* Frames overlay */}
      {frames.map((frame, i) => {
        const colors = COLOR_MAP[frame.color];
        return (
          <div
            key={`${frame.id}-${i}`}
            onClick={(e) => handleFrameClick(e, frame)}
            style={{
              position: 'absolute',
              top: frame.top,
              left: frame.left,
              width: frame.width,
              height: frame.height,
              border: `1.5px solid ${colors.border}`,
              background: colors.bg,
              boxSizing: 'border-box',
              pointerEvents: 'auto',
              zIndex: 99900,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -1,
                left: 0,
                background: colors.badge,
                color: '#fff',
                fontSize: '9px',
                fontFamily: 'monospace',
                padding: '0 4px',
                lineHeight: '16px',
                borderRadius: '0 0 4px 0',
                maxWidth: frame.width - 4,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                pointerEvents: 'none',
              }}
            >
              {frame.label}
            </span>
          </div>
        );
      })}

      {/* Tooltip - Only closes on ✕ button click */}
      {tooltip.visible && (
        <div
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          style={{
            position: 'fixed',
            top: Math.min(tooltip.y, 20),
            left: Math.min(tooltip.x, window.innerWidth - 380),
            zIndex: 100000,
            background: '#0f172a',
            border: '1px solid #1e40af',
            borderRadius: '10px',
            padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#e2e8f0',
            minWidth: '340px',
            maxWidth: '380px',
            maxHeight: '80vh',
            overflowY: 'auto',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '13px' }}>
              UI Identity Inspector
            </div>
            <button
              onClick={dismissTooltip}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <Row label="Stable ID" value={tooltip.id} color="#a78bfa" />
            <Row label="Path" value={tooltip.path} color="#6ee7b7" />
            <Row label="Feature" value={tooltip.feature} color="#fbbf24" />
            <Row label="Version" value={tooltip.version} color="#94a3b8" />
            {tooltip.deprecated && (
              <div style={{ color: '#f87171', marginTop: '4px', fontWeight: 600 }}>⚠ DEPRECATED</div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #1e293b', marginTop: '8px', paddingTop: '8px' }}>
            <Row label="Component" value={tooltip.sourceComponent} color="#f472b6" />
            <Row label="File" value={tooltip.sourceFile} color="#94a3b8" />
            {tooltip.sourceLine > 0 && <Row label="Line" value={String(tooltip.sourceLine)} color="#94a3b8" />}
          </div>

          {/* Database Section */}
          <div style={{ borderTop: '1px solid #1e293b', marginTop: '12px', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '12px' }}>Database</span>
              <button
                onClick={() => setTooltip(t => ({ ...t, databaseEnabled: !t.databaseEnabled }))}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: tooltip.databaseEnabled ? '#22c55e' : '#475569',
                  color: '#fff',
                  fontFamily: 'monospace',
                }}
              >
                {tooltip.databaseEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Database Inputs (only if enabled) */}
            {tooltip.databaseEnabled && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px', minWidth: '40px' }}>inf1</span>
                  <input
                    type="text"
                    value={tooltip.inf1}
                    onChange={(e) => setTooltip(t => ({ ...t, inf1: e.target.value }))}
                    style={{
                      flex: 1,
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px',
                      color: '#e2e8f0',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px', minWidth: '40px' }}>inf2</span>
                  <input
                    type="text"
                    value={tooltip.inf2}
                    onChange={(e) => setTooltip(t => ({ ...t, inf2: e.target.value }))}
                    style={{
                      flex: 1,
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px',
                      color: '#e2e8f0',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px', minWidth: '40px' }}>inf3</span>
                  <input
                    type="text"
                    value={tooltip.inf3}
                    onChange={(e) => setTooltip(t => ({ ...t, inf3: e.target.value }))}
                    style={{
                      flex: 1,
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px',
                      color: '#e2e8f0',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Attributes Section */}
          <div style={{ borderTop: '1px solid #1e293b', marginTop: '12px', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#f472b6', fontWeight: 600, fontSize: '12px' }}>Attributes</span>
              <button
                onClick={() => setTooltip(t => ({ ...t, attributesEnabled: !t.attributesEnabled }))}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: tooltip.attributesEnabled ? '#22c55e' : '#475569',
                  color: '#fff',
                  fontFamily: 'monospace',
                }}
              >
                {tooltip.attributesEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Attributes Checkboxes (only if enabled) */}
            {tooltip.attributesEnabled && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tooltip.attribute1}
                    onChange={(e) => setTooltip(t => ({ ...t, attribute1: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>Attribute 1</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tooltip.attribute2}
                    onChange={(e) => setTooltip(t => ({ ...t, attribute2: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>Attribute 2</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tooltip.attribute3}
                    onChange={(e) => setTooltip(t => ({ ...t, attribute3: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>Attribute 3</span>
                </label>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                background: saveStatus === 'saved' 
                  ? '#22c55e' 
                  : saveStatus === 'error' 
                  ? '#ef4444' 
                  : '#2563eb',
                color: '#fff',
                transition: 'all 0.2s',
                fontFamily: 'monospace',
              }}
            >
              {isSaving 
                ? 'Saving...' 
                : saveStatus === 'saved' 
                ? '✓ Saved!' 
                : saveStatus === 'error' 
                ? '✗ Failed' 
                : '💾 Save Data'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
      <span style={{ color: '#475569', minWidth: '70px' }}>{label}:</span>
      <span style={{ color, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
