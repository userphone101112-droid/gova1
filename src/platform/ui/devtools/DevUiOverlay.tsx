'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { UI_ID_MAP } from '@/platform/ui/registry/registry';
import { UI_SOURCE_INDEX } from '@/platform/ui/registry/source-index';
import { useMaolStore } from '@/store/index';
import { UiButton, UiDiv } from '@/platform/ui';
import { DECORATIVE } from '@/platform/ui/registry/categories';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  id: string;
  instanceId: string;
  path: string;
  feature: string;
  version: string;
  deprecated: boolean;
  sourceFile: string;
  sourceComponent: string;
  sourceLine: number;
  databaseEnabled: boolean;
  inf1: string;
  inf2: string;
  inf3: string;
  attributesEnabled: boolean;
  attribute1: boolean;
  attribute2: boolean;
  attribute3: boolean;
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
  componentType: string;
}

const STORAGE_KEY = 'dev-ui-overlay-active';

const ALL_COMPONENT_TYPES = [
  'UiButton',
  'UiInput',
  'UiTextarea',
  'UiSelect',
  'UiLink',
  'UiImage',
  'UiLabel',
  'UiHeader',
  'UiCheckbox',
  'UiRadio',
  'UiSwitch',
  'UiCard',
  'UiModal',
  'UiBadge',
  'UiDiv',
  'UiSection',
] as const;

type ComponentType = typeof ALL_COMPONENT_TYPES[number];

function computeFrames(selectedTypes: Set<ComponentType>): OverlayFrame[] {
  if (typeof window === 'undefined') return [];
  
  const elements = document.querySelectorAll<HTMLElement>('[data-ui-id]');
  const frames: OverlayFrame[] = [];

  elements.forEach((el) => {
    const id = el.getAttribute('data-ui-id') || '';
    const componentType = el.getAttribute('data-ui-component') || 'Unknown';
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
      componentType,
    });
  });

  return frames.filter(f => selectedTypes.has(f.componentType as ComponentType));
}

const COLOR_MAP = {
  blue: { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)', badge: '#2563eb' },
  amber: { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', badge: '#d97706' },
  red: { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', badge: '#dc2626' },
};

export function DevUiOverlay() {
  const [active, setActive] = useState<boolean>(() => {
    // Initialize from localStorage if exists, otherwise default to false
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    }
    return false;
  });
  const isMaolEnabled = useMaolStore((state) => state.isEnabled);
  const toggleMaol = useMaolStore((state) => state.toggleMaol);

  // Filter state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedComponentTypes, setSelectedComponentTypes] = useState<Set<ComponentType>>(new Set());
  const [isHoverInspectionEnabled, setIsHoverInspectionEnabled] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState<OverlayFrame | null>(null);

  // Function to compute component type counts
  const getComponentCounts = useCallback((selectedTypes: Set<ComponentType>) => {
    if (typeof window === 'undefined') {
      const counts: Record<string, number> = {};
      ALL_COMPONENT_TYPES.forEach(type => counts[type] = 0);
      return counts;
    }
    
    const counts: Record<string, number> = {};
    ALL_COMPONENT_TYPES.forEach(type => counts[type] = 0);
    const elements = document.querySelectorAll<HTMLElement>('[data-ui-id]');
    elements.forEach(el => {
      const type = el.getAttribute('data-ui-component');
      if (type && selectedTypes.has(type as ComponentType)) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });
    return counts;
  }, []);

  const [frames, setFrames] = useState<OverlayFrame[]>([]);
  const [componentCounts, setComponentCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ALL_COMPONENT_TYPES.forEach(type => initial[type] = 0);
    return initial;
  });

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0, y: 0,
    id: '', instanceId: '', path: '', feature: '', version: '',
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
  const [currentChildren, setCurrentChildren] = useState<Array<{ id: string; componentType: string }>>([]);

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
      const effectiveTypes = selectedComponentTypes.size === 0 
        ? new Set(ALL_COMPONENT_TYPES) 
        : selectedComponentTypes;
      const newFrames = computeFrames(effectiveTypes);
      setFrames(newFrames);
      setComponentCounts(getComponentCounts(effectiveTypes));
    });
  }, [selectedComponentTypes, getComponentCounts]);

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

  const dismissTooltip = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  // Helper to get UI element from coordinates
  const getUiElementFromPoint = useCallback((clientX: number, clientY: number): HTMLElement | null => {
    // Get ALL elements under the cursor (from top to bottom)
    const elements = document.elementsFromPoint(clientX, clientY) as HTMLElement[];
    
    // Iterate through elements one by one (top to bottom) to find the first valid UI element
    for (const el of elements) {
      // Skip if this element or any ancestor is our UI controls
      if (
        el.closest('[data-tooltip="true"]') || 
        el.closest('[data-control-panel="true"]') ||
        el.closest('[data-inspector-overlay="true"]')
      ) {
        continue;
      }
      
      // Check if this element or any ancestor has data-ui-id
      const uiElement = el.closest('[data-ui-id]') as HTMLElement | null;
      if (!uiElement) {
        continue;
      }
      
      // Skip decorative spacer
      const uiId = uiElement.getAttribute('data-ui-id');
      if (uiId === 'UI_COMMON_DECORATIVE_SPACER') {
        continue;
      }
      
      // Found our first valid UI element! Return it immediately (closest to cursor)
      return uiElement;
    }
    
    // No valid UI element found
    return null;
  }, []);

  // Helper to get child UI elements from a given UI id
  const getChildUiElements = useCallback((uiId: string): Array<{ id: string; componentType: string }> => {
    // Find the element by its data-ui-id
    const parentElement = document.querySelector(`[data-ui-id="${uiId}"]`) as HTMLElement | null;
    if (!parentElement) return [];
    
    // Get all descendant elements that have data-ui-id, but are not nested inside another UI element
    const children: Array<{ id: string; componentType: string }> = [];
    
    // Iterate through all descendants
    const allDescendants = parentElement.querySelectorAll('[data-ui-id]');
    for (const descendant of allDescendants) {
      const descId = descendant.getAttribute('data-ui-id');
      if (!descId) continue;
      
      // Skip decorative spacer
      if (descId === 'UI_COMMON_DECORATIVE_SPACER') continue;
      
      // Check if this descendant is a direct child (not nested inside another UI element)
      let isDirectChild = true;
      let current: Element | null = descendant.parentElement;
      while (current && current !== parentElement) {
        if (current.hasAttribute('data-ui-id')) {
          isDirectChild = false;
          break;
        }
        current = current.parentElement;
      }
      
      if (isDirectChild && !children.find(c => c.id === descId)) {
        children.push({
          id: descId,
          componentType: descendant.getAttribute('data-ui-component') || 'Unknown'
        });
      }
    }
    
    return children;
  }, []);

  // Update current children when tooltip id or frames change
  useEffect(() => {
    if (!tooltip.visible || !tooltip.id) {
      setCurrentChildren([]);
      return;
    }
    setCurrentChildren(getChildUiElements(tooltip.id));
  }, [tooltip.id, tooltip.visible, frames, getChildUiElements]);

  // Hover inspection - show frame on mousemove when enabled
  useEffect(() => {
    if (!isHoverInspectionEnabled || !active) return;

    const handleMouseMove = (e: MouseEvent) => {
      const uiElement = getUiElementFromPoint(e.clientX, e.clientY);
      if (!uiElement) {
        setHoveredFrame(null);
        return;
      }

      const uiId = uiElement.getAttribute('data-ui-id');
      if (!uiId) return;

      // Skip hover inspection for UI_COMMON_DECORATIVE_SPACER
      if (uiId === 'UI_COMMON_DECORATIVE_SPACER') return;

      const componentType = uiElement.getAttribute('data-ui-component') || 'Unknown';
      const rect = uiElement.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const identity = UI_ID_MAP[uiId];
      let color: 'blue' | 'amber' | 'red' = 'red';
      let label = uiId || '?';

      if (identity) {
        color = identity.deprecated ? 'amber' : 'blue';
        label = identity.id;
      }

      setHoveredFrame({
        id: uiId,
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        color,
        label,
        componentType,
      });
    };

    // Add event listener to document
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      setHoveredFrame(null);
    };
  }, [isHoverInspectionEnabled, active, getUiElementFromPoint]);

  // Document click handler to open tooltip when UI Inspector is active
  useEffect(() => {
    if (!active) return;

    const handleDocumentClick = (e: MouseEvent) => {
      // Don't open tooltip if clicking on the tooltip itself or control panel
      const clickedOnTooltip = (e.target as HTMLElement).closest('[data-tooltip="true"]');
      const clickedOnControlPanel = (e.target as HTMLElement).closest('[data-control-panel="true"]');
      if (clickedOnTooltip || clickedOnControlPanel) return;

      const uiElement = getUiElementFromPoint(e.clientX, e.clientY);
      if (!uiElement) return;

      const uiId = uiElement.getAttribute('data-ui-id');
      if (!uiId) return;

      const identity = UI_ID_MAP[uiId];
      const source = UI_SOURCE_INDEX[uiId];
      const savedData = allInspectorData[uiId];

      // Open tooltip
      setTooltip({
        visible: true,
        x: e.clientX + 12,
        y: e.clientY + 12,
        id: uiId,
        instanceId: `${uiId}_${Date.now()}`,
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
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [active, getUiElementFromPoint, allInspectorData]);

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

  // Filter functions
  const toggleComponentFilter = (type: ComponentType) => {
    setSelectedComponentTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) newSet.delete(type);
      else newSet.add(type);
      return newSet;
    });
  };

  const selectAllComponents = () => {
    if (selectedComponentTypes.size < ALL_COMPONENT_TYPES.length) {
      setSelectedComponentTypes(new Set(ALL_COMPONENT_TYPES));
    }
  };

  const deselectAllComponents = () => {
    if (selectedComponentTypes.size > 0) {
      setSelectedComponentTypes(new Set());
    }
  };

  // Update component counts when frames change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setComponentCounts(getComponentCounts(selectedComponentTypes));
    }
  }, [frames, selectedComponentTypes, getComponentCounts]);

  if (!active && frames.length === 0) {
    return (
      <UiButton
        ui={DECORATIVE.SPACER}
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
      </UiButton>
    );
  }

  return (
    <>
      {/* Control bar - Always visible, works across all screen sizes */}
      <UiDiv
        ui={DECORATIVE.SPACER}
        data-control-panel="true"
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
        <UiButton
          ui={DECORATIVE.SPACER}
          onClick={() => setIsHoverInspectionEnabled(!isHoverInspectionEnabled)}
          style={{
            padding: '2px 8px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 600,
            background: isHoverInspectionEnabled ? '#22c55e' : '#475569',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          Hover {isHoverInspectionEnabled ? 'ON' : 'OFF'}
        </UiButton>
        <span>|</span>
        {isFilterPanelOpen && (
          <>
            <span style={{ color: '#22c55e' }}>{frames.filter(f => f.color === 'blue').length} ok</span>
            <span style={{ color: '#f59e0b' }}>{frames.filter(f => f.color === 'amber').length} dep</span>
            <span style={{ color: '#ef4444' }}>{frames.filter(f => f.color === 'red').length} err</span>
            <span>|</span>
          </>
        )}
        {/* Filter Types Button */}
        <UiButton
                ui={DECORATIVE.SPACER}
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                style={{
                  padding: '2px 10px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: isFilterPanelOpen ? '#22c55e' : '#475569',
                  color: '#fff',
                  fontFamily: 'monospace',
                }}
              >
                أنواع العناصر
              </UiButton>
        <span>|</span>
        {/* MAOL Toggle - Toggle MAOL ON/OFF directly from here */}
        <UiButton
          ui={DECORATIVE.SPACER}
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
        </UiButton>
        <span>|</span>
        <UiButton
          ui={DECORATIVE.SPACER}
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
        </UiButton>
      </UiDiv>

      {/* Filter Panel */}
      {isFilterPanelOpen && (
        <UiDiv
          ui={DECORATIVE.SPACER}
          style={{
            position: 'fixed',
            bottom: '110px',
            right: '12px',
            zIndex: 99998,
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '10px',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontSize: '11px',
            fontFamily: 'monospace',
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          <div style={{ 
            position: 'sticky',
            top: 0,
            background: '#0f172a',
            zIndex: 1,
            paddingBottom: '8px',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '4px',
            borderBottom: '1px solid #334155'
          }}>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '12px' }}>أنواع المكونات</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#e2e8f0', fontSize: '11px' }}>
                <input
                  type="checkbox"
                  checked={selectedComponentTypes.size === ALL_COMPONENT_TYPES.length}
                  onChange={selectAllComponents}
                  style={{ cursor: 'pointer' }}
                />
                اختيار الكل
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#e2e8f0', fontSize: '11px' }}>
                <input
                  type="checkbox"
                  checked={selectedComponentTypes.size === 0}
                  onChange={deselectAllComponents}
                  style={{ cursor: 'pointer' }}
                />
                إلغاء الكل
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {ALL_COMPONENT_TYPES.map((type) => (
              <div
                key={type}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: selectedComponentTypes.has(type) ? 'rgba(34,197,94,0.1)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#e2e8f0' }}>{type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isFilterPanelOpen && (
                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                      {(componentCounts[type] || 0) > 99 ? '99+' : (componentCounts[type] || 0)}
                    </span>
                  )}
                  <button
                    onClick={() => toggleComponentFilter(type)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 600,
                      background: selectedComponentTypes.has(type) ? '#22c55e' : '#475569',
                      color: '#fff',
                      fontFamily: 'monospace',
                    }}
                  >
                    {selectedComponentTypes.has(type) ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </UiDiv>
      )}

      {/* Frames overlay */}
      {/* Show all frames only when filter panel is open */}
      {isFilterPanelOpen && frames.map((frame, i) => {
        const colors = COLOR_MAP[frame.color];
        const isHovered = hoveredFrame && hoveredFrame.id === frame.id;
        return (
          <UiDiv
            key={`${frame.id}-${i}`}
            ui={DECORATIVE.SPACER}
            data-inspector-overlay="true"
            style={{
              position: 'absolute',
              top: frame.top,
              left: frame.left,
              width: frame.width,
              height: frame.height,
              border: isHovered ? `2px solid ${colors.border}` : `1.5px solid ${colors.border}`,
              background: colors.bg,
              boxSizing: 'border-box',
              pointerEvents: 'none',
              zIndex: isHovered ? 99999 : 99900,
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
          </UiDiv>
        );
      })}
      
      {/* Show only hovered frame when Hover is ON */}
      {isHoverInspectionEnabled && hoveredFrame && (
        <UiDiv
          key={`hovered-${hoveredFrame.id}`}
          ui={DECORATIVE.SPACER}
          data-inspector-overlay="true"
          style={{
            position: 'absolute',
            top: hoveredFrame.top,
            left: hoveredFrame.left,
            width: hoveredFrame.width,
            height: hoveredFrame.height,
            border: `2px solid ${COLOR_MAP[hoveredFrame.color].border}`,
            background: COLOR_MAP[hoveredFrame.color].bg,
            boxSizing: 'border-box',
            pointerEvents: 'none',
            zIndex: 99999,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: -1,
              left: 0,
              background: COLOR_MAP[hoveredFrame.color].badge,
              color: '#fff',
              fontSize: '9px',
              fontFamily: 'monospace',
              padding: '0 4px',
              lineHeight: '16px',
              borderRadius: '0 0 4px 0',
              maxWidth: hoveredFrame.width - 4,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              pointerEvents: 'none',
            }}
          >
            {hoveredFrame.label}
          </span>
        </UiDiv>
      )}

      {/* Tooltip - Only closes on ✕ button click */}
      {tooltip.visible && (
        <UiDiv
          key={tooltip.instanceId}
          ui={DECORATIVE.SPACER}
          data-tooltip="true"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          style={{
            position: 'fixed',
            top: Math.min(tooltip.y, 20),
            left: Math.min(tooltip.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 380),
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
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '13px' }}>
              UI Identity Inspector
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissTooltip();
              }}
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

          {/* Children Section */}
          <div style={{ borderTop: '1px solid #1e293b', marginTop: '12px', paddingTop: '12px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '12px' }}>العناصر الأبن</span>
            </div>
            {currentChildren.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '10px', fontStyle: 'italic', padding: '8px 0' }}>
                لا يوجد عناصر أبن
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                {currentChildren.map((child, index) => (
                  <div 
                    key={`${child.id}_${index}`}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={() => {
                      // Show hover frame on child
                      const el = document.querySelector(`[data-ui-id="${child.id}"]`) as HTMLElement | null;
                      if (!el) return;
                      const rect = el.getBoundingClientRect();
                      const identity = UI_ID_MAP[child.id];
                      let color: 'blue' | 'amber' | 'red' = 'red';
                      if (identity) {
                        color = identity.deprecated ? 'amber' : 'blue';
                      }
                      setHoveredFrame({
                        id: child.id,
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                        height: rect.height,
                        color,
                        label: child.id,
                        componentType: child.componentType,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredFrame(null);
                    }}
                    onClick={(e) => {
                      // Select this child element
                      e.stopPropagation();
                      const el = document.querySelector(`[data-ui-id="${child.id}"]`) as HTMLElement | null;
                      if (!el) return;
                      const identity = UI_ID_MAP[child.id];
                      const source = UI_SOURCE_INDEX[child.id];
                      const savedData = allInspectorData[child.id];
                      const rect = el.getBoundingClientRect();

                      setTooltip({
                        visible: true,
                        x: rect.left + rect.width + 12,
                        y: rect.top,
                        id: child.id,
                        instanceId: `${child.id}_${Date.now()}`,
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
                    }}
                  >
                    <div style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 500 }}>
                      {child.id}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>
                      {child.componentType}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <UiButton
              ui={DECORATIVE.SPACER}
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
            </UiButton>
          </div>
        </UiDiv>
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
