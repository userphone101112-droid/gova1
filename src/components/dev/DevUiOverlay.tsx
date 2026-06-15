'use client';

/**
 * DevUiOverlay — Developer Visual Inspector
 *
 * Activated with Ctrl+Shift+U.
 * Renders colored frames around all [data-ui-id] elements:
 *   - Blue:   valid, active identity
 *   - Amber:  deprecated identity
 *   - Red:    unknown / unregistered element
 *
 * A floating tooltip shows Stable ID, path, feature, version, and source file.
 *
 * This component is tree-shaken from production builds via process.env check.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UI_ID_MAP } from '@/shared/ui-registry';
import { UI_SOURCE_INDEX } from '@/shared/ui-source-index';

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
  const [active, setActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [frames, setFrames] = useState<OverlayFrame[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0, y: 0,
    id: '', path: '', feature: '', version: '',
    deprecated: false,
    sourceFile: '', sourceComponent: '', sourceLine: 0,
  });

  const rafRef = useRef<number | null>(null);

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

  // Dismiss tooltip on scroll
  useEffect(() => {
    if (!active) return;
    const hide = () => setTooltip((t) => ({ ...t, visible: false }));
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [active]);

  const handleFrameClick = useCallback((e: React.MouseEvent, frame: OverlayFrame) => {
    e.stopPropagation();
    const identity = UI_ID_MAP[frame.id];
    const source = UI_SOURCE_INDEX[frame.id];

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
    });
  }, []);

  const dismissTooltip = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

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
      {/* Control bar */}
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

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          onClick={dismissTooltip}
          style={{
            position: 'fixed',
            top: Math.min(tooltip.y, window.innerHeight - 260),
            left: Math.min(tooltip.x, window.innerWidth - 300),
            zIndex: 100000,
            background: '#0f172a',
            border: '1px solid #1e40af',
            borderRadius: '10px',
            padding: '12px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#e2e8f0',
            minWidth: '260px',
            maxWidth: '340px',
            cursor: 'pointer',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '8px', fontSize: '12px' }}>
            UI Identity Inspector
          </div>
          <Row label="Stable ID" value={tooltip.id} color="#a78bfa" />
          <Row label="Path" value={tooltip.path} color="#6ee7b7" />
          <Row label="Feature" value={tooltip.feature} color="#fbbf24" />
          <Row label="Version" value={tooltip.version} color="#94a3b8" />
          {tooltip.deprecated && (
            <div style={{ color: '#f87171', marginTop: '4px', fontWeight: 600 }}>⚠ DEPRECATED</div>
          )}
          <div style={{ borderTop: '1px solid #1e293b', marginTop: '8px', paddingTop: '8px' }}>
            <Row label="Component" value={tooltip.sourceComponent} color="#f472b6" />
            <Row label="File" value={tooltip.sourceFile} color="#94a3b8" />
            {tooltip.sourceLine > 0 && <Row label="Line" value={String(tooltip.sourceLine)} color="#94a3b8" />}
          </div>
          <div style={{ color: '#475569', marginTop: '6px', fontSize: '9px' }}>click to dismiss</div>
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
