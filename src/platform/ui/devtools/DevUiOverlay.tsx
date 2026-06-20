'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { DECORATIVE } from '@/platform/ui/registry/categories';
import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';
import { getUiIdentityByUuid, getUiIdentityLifecycle, getUiIdentityUuid } from '@/platform/ui/registry/registry';
import { UI_SOURCE_INDEX_BY_UUID } from '@/platform/ui/registry/source-index';
import { useMaolStore } from '@/store/index';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  uuid: string;
  uiInstanceId: string;
  identityKey: string;
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
  dataUiUuid: string;
  dataUiInstanceId: string;
  dataUiIdentityKey: string;
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

const ALL_ELEMENT_TAGS = [
  'button',
  'input',
  'textarea',
  'select',
  'a',
  'img',
  'span',
  'label',
  'div',
  'section',
  'header',
  'main',
  'nav',
  'article',
  'aside',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'form',
  'table',
  'dialog',
] as const;

type ElementTag = typeof ALL_ELEMENT_TAGS[number];

const DECORATIVE_SPACER_UUID = DECORATIVE.SPACER.uuid;

function getInspectorData(
  data: Record<string, any>,
  uuid: string,
  identityKey: string,
  identity: ReturnType<typeof getUiIdentityByUuid>
) {
  return data[identityKey] || (uuid && data[uuid]) || (identity ? data[identity.id] : undefined);
}

function computeFrames(selectedTags: Set<ElementTag>): OverlayFrame[] {
  if (typeof window === 'undefined') return [];
  
  const elements = document.querySelectorAll<HTMLElement>('[data-ui-uuid]');
  const frames: OverlayFrame[] = [];

  elements.forEach((el) => {
    const uuid = el.getAttribute('data-ui-uuid') || '';
    const componentType = el.tagName.toLowerCase();
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const identity = getUiIdentityByUuid(uuid);
    let color: 'blue' | 'amber' | 'red' = 'red';
    let label = uuid.slice(0, 8) || '?';

    if (identity) {
      color = getUiIdentityLifecycle(identity) === 'deprecated' ? 'amber' : 'blue';
      label = identity.id;
    }

    frames.push({
      id: uuid,
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
      color,
      label,
      componentType,
    });
  });

  return frames.filter(f => selectedTags.has(f.componentType as ElementTag));
}

const COLOR_MAP = {
  blue: { border: 'var(--gova-component-dev-ui-blue-border)', bg: 'var(--gova-component-dev-ui-blue-bg)', badge: 'var(--gova-component-dev-ui-blue-badge)' },
  amber: { border: 'var(--gova-component-dev-ui-amber-border)', bg: 'var(--gova-component-dev-ui-amber-bg)', badge: 'var(--gova-component-dev-ui-amber-badge)' },
  red: { border: 'var(--gova-component-dev-ui-red-border)', bg: 'var(--gova-component-dev-ui-red-bg)', badge: 'var(--gova-component-dev-ui-red-badge)' },
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
  const [selectedComponentTypes, setSelectedComponentTypes] = useState<Set<ElementTag>>(new Set());
  const [isHoverInspectionEnabled, setIsHoverInspectionEnabled] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState<OverlayFrame | null>(null);

  // Function to compute component type counts
  const getComponentCounts = useCallback((selectedTags: Set<ElementTag>) => {
    if (typeof window === 'undefined') {
      const counts: Record<string, number> = {};
      ALL_ELEMENT_TAGS.forEach(type => counts[type] = 0);
      return counts;
    }
    
    const counts: Record<string, number> = {};
    ALL_ELEMENT_TAGS.forEach(type => counts[type] = 0);
    const elements = document.querySelectorAll<HTMLElement>('[data-ui-uuid]');
    elements.forEach(el => {
      const type = el.tagName.toLowerCase();
      if (type && selectedTags.has(type as ElementTag)) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });
    return counts;
  }, []);

  const [frames, setFrames] = useState<OverlayFrame[]>([]);
  const [componentCounts, setComponentCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ALL_ELEMENT_TAGS.forEach(type => initial[type] = 0);
    return initial;
  });

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0, y: 0,
    uuid: '', uiInstanceId: '', identityKey: '', id: '', instanceId: '', path: '', feature: '', version: '',
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
    dataUiUuid: '',
    dataUiInstanceId: '',
    dataUiIdentityKey: '',
  });

  const [allInspectorData, setAllInspectorData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [currentChildren, setCurrentChildren] = useState<Array<{ id: string; identityKey: string; componentType: string }>>([]);

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
        ? new Set(ALL_ELEMENT_TAGS) 
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
      
      // Check if this element or any ancestor has data-ui-uuid
      const uiElement = el.closest('[data-ui-uuid]') as HTMLElement | null;
      if (!uiElement) {
        continue;
      }
      
      const uuid = uiElement.getAttribute('data-ui-uuid');
      if (uuid === DECORATIVE_SPACER_UUID) {
        continue;
      }
      
      // Found our first valid UI element! Return it immediately (closest to cursor)
      return uiElement;
    }
    
    // No valid UI element found
    return null;
  }, []);

  // Helper to get child UI elements from a given UUID
  const getChildUiElements = useCallback((uuid: string): Array<{ id: string; identityKey: string; componentType: string }> => {
    const parentElement = document.querySelector(`[data-ui-uuid="${uuid}"]`) as HTMLElement | null;
    if (!parentElement) return [];
    
    const children: Array<{ id: string; identityKey: string; componentType: string }> = [];
    const allDescendants = parentElement.querySelectorAll('[data-ui-uuid]');
    for (const descendant of allDescendants) {
      const descUuid = descendant.getAttribute('data-ui-uuid');
      if (!descUuid) continue;
      if (descUuid === DECORATIVE_SPACER_UUID) continue;
      
      let isDirectChild = true;
      let current: Element | null = descendant.parentElement;
      while (current && current !== parentElement) {
        if (current.hasAttribute('data-ui-uuid')) {
          isDirectChild = false;
          break;
        }
        current = current.parentElement;
      }
      
      const identityKey = descendant.getAttribute('data-ui-identity-key') || descUuid;
      if (isDirectChild && !children.find(c => c.identityKey === identityKey)) {
        children.push({
          id: descUuid,
          identityKey,
          componentType: descendant.tagName.toLowerCase()
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

      const uiUuid = uiElement.getAttribute('data-ui-uuid');
      if (!uiUuid) return;
      if (uiUuid === DECORATIVE_SPACER_UUID) return;

      const componentType = uiElement.tagName.toLowerCase();
      const rect = uiElement.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const identity = getUiIdentityByUuid(uiUuid);
      let color: 'blue' | 'amber' | 'red' = 'red';
      let label = uiUuid.slice(0, 8) || '?';

      if (identity) {
        color = getUiIdentityLifecycle(identity) === 'deprecated' ? 'amber' : 'blue';
        label = identity.id;
      }

      setHoveredFrame({
        id: uiUuid,
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

      const uiUuid = uiElement.getAttribute('data-ui-uuid');
      if (!uiUuid) return;

      const identity = getUiIdentityByUuid(uiUuid);
      const source = UI_SOURCE_INDEX_BY_UUID[uiUuid];
      const uiInstanceId = uiElement.getAttribute('data-ui-instance-id') || '';
      const identityKey = uiElement.getAttribute('data-ui-identity-key') || uiUuid;
      const savedData = getInspectorData(allInspectorData, uiUuid, identityKey, identity);

      setTooltip({
        visible: true,
        x: e.clientX + 12,
        y: e.clientY + 12,
        uuid: uiUuid,
        uiInstanceId,
        identityKey,
        id: identity?.id || uiUuid,
        instanceId: `${uiUuid}_${Date.now()}`,
        path: identity?.path || '—',
        feature: identity?.feature || '—',
        version: identity?.version || '—',
        deprecated: identity ? getUiIdentityLifecycle(identity) === 'deprecated' : false,
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
        dataUiUuid: savedData?.dataUiUuid || uiUuid,
        dataUiInstanceId: savedData?.dataUiInstanceId || uiInstanceId,
        dataUiIdentityKey: savedData?.dataUiIdentityKey || identityKey,
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
          uiUuid: tooltip.uuid,
          uiInstanceId: tooltip.uiInstanceId,
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
          [tooltip.identityKey || tooltip.uuid || tooltip.id]: {
            databaseEnabled: tooltip.databaseEnabled,
            inf1: tooltip.inf1,
            inf2: tooltip.inf2,
            inf3: tooltip.inf3,
            attributesEnabled: tooltip.attributesEnabled,
            attribute1: tooltip.attribute1,
            attribute2: tooltip.attribute2,
            attribute3: tooltip.attribute3,
            dataUiPath: tooltip.path,
            dataUiFeature: tooltip.feature,
            dataUiUuid: tooltip.uuid,
            dataUiInstanceId: tooltip.uiInstanceId,
            dataUiIdentityKey: tooltip.identityKey,
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
  const toggleComponentFilter = (type: ElementTag) => {
    setSelectedComponentTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) newSet.delete(type);
      else newSet.add(type);
      return newSet;
    });
  };

  const selectAllComponents = () => {
    if (selectedComponentTypes.size < ALL_ELEMENT_TAGS.length) {
      setSelectedComponentTypes(new Set(ALL_ELEMENT_TAGS));
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
      <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L560.uuid} aria-label="Toggle UI Identity Overlay (Ctrl+Shift+U)" title="Toggle UI Identity Overlay (Ctrl+Shift+U)" onClick={() => setActive(true)} style={{
        position: 'fixed',
        bottom: '72px',
        right: '12px',
        zIndex: 99990,
        background: 'var(--gova-component-dev-ui-bg-darker)',
        color: 'var(--gova-component-dev-ui-text-secondary)',
        border: '1px solid var(--gova-component-dev-ui-border-color)',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '11px',
        cursor: 'pointer',
        fontFamily: 'monospace',
        opacity: 0.6,
    }}>
        UI Inspector
      </button>
    );
  }

  return (
    <>
      {/* Control bar - Always visible, works across all screen sizes */}
      <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L583.uuid} data-control-panel="true" style={{
        position: 'fixed',
        bottom: '72px',
        right: '12px',
        zIndex: 99999,
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        background: 'var(--gova-component-dev-ui-bg-dark)',
        border: '1px solid var(--gova-component-dev-ui-border-color)',
        borderRadius: '10px',
        padding: '6px 10px',
        boxShadow: 'var(--gova-component-dev-ui-shadow-1)',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: 'var(--gova-component-dev-ui-text-secondary)',
    }}>
        <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L600.uuid} style={{ color: 'var(--gova-component-dev-ui-primary)', fontWeight: 700 }}>UI Inspector</span>
        <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L601.uuid}>|</span>
        <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L602.uuid} onClick={() => setIsHoverInspectionEnabled(!isHoverInspectionEnabled)} style={{
        padding: '2px 8px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: 600,
        background: isHoverInspectionEnabled ? 'var(--gova-component-dev-ui-success)' : 'var(--gova-component-dev-ui-secondary)',
        color: 'var(--gova-on-primary)',
        fontFamily: 'monospace',
    }}>
          Hover {isHoverInspectionEnabled ? 'ON' : 'OFF'}
        </button>
        <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L615.uuid}>|</span>
        {isFilterPanelOpen && (
          <>
            <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L618.uuid} style={{ color: 'var(--gova-component-dev-ui-success)' }}>{frames.filter(f => f.color === 'blue').length} ok</span>
            <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L619.uuid} style={{ color: 'var(--gova-component-dev-ui-amber)' }}>{frames.filter(f => f.color === 'amber').length} dep</span>
            <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L620.uuid} style={{ color: 'var(--gova-component-dev-ui-error)' }}>{frames.filter(f => f.color === 'red').length} err</span>
            <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L621.uuid}>|</span>
          </>
        )}
        {/* Filter Types Button */}
        <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L625.uuid} onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} style={{
        padding: '2px 10px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: 600,
        background: isFilterPanelOpen ? 'var(--gova-component-dev-ui-success)' : 'var(--gova-component-dev-ui-secondary)',
        color: 'var(--gova-on-primary)',
        fontFamily: 'monospace',
    }}>
                أنواع العناصر
              </button>
        <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L638.uuid}>|</span>
        {/* MAOL Toggle - Toggle MAOL ON/OFF directly from here */}
        <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L640.uuid} onClick={toggleMaol} style={{
        padding: '2px 8px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: 600,
        background: isMaolEnabled ? 'var(--gova-component-dev-ui-success)' : 'var(--gova-component-dev-ui-secondary)',
        color: 'var(--gova-on-primary)',
        fontFamily: 'monospace',
    }}>
          MAOL {isMaolEnabled ? 'ON' : 'OFF'}
        </button>
        <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L653.uuid}>|</span>
        <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L654.uuid} onClick={() => {
        setActive(false);
        setTooltip(t => ({ ...t, visible: false }));
        try {
            localStorage.setItem(STORAGE_KEY, 'false');
        }
        catch { /* noop */ }
    }} style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--gova-component-dev-ui-text-muted)',
        cursor: 'pointer',
        fontSize: '12px',
        padding: '0 2px',
    }} aria-label="Close UI Inspector" title="Close (Ctrl+Shift+U)">
          ✕
        </button>
      </div>

      {/* Filter Panel */}
      {isFilterPanelOpen && (
        <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L675.uuid} style={{
        position: 'fixed',
        bottom: '110px',
        right: '12px',
        zIndex: 99998,
        background: 'var(--gova-component-dev-ui-bg-dark)',
        border: '1px solid var(--gova-component-dev-ui-border-color)',
        borderRadius: '10px',
        padding: '12px',
        boxShadow: 'var(--gova-component-dev-ui-shadow-2)',
        fontSize: '11px',
        fontFamily: 'monospace',
        minWidth: '200px',
        maxHeight: '300px',
        overflowY: 'auto',
    }}>
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L691.uuid} style={{ 
            position: 'sticky',
            top: 0,
            background: 'var(--gova-component-dev-ui-bg-dark)',
            zIndex: 1,
            paddingBottom: '8px',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '4px',
            borderBottom: '1px solid var(--gova-component-dev-ui-border-color)'
          }}>
            <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L703.uuid} style={{ color: 'var(--gova-component-dev-ui-primary-light)', fontWeight: 700, fontSize: '12px' }}>أنواع المكونات</span>
            <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L704.uuid} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L705.uuid} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--gova-component-dev-ui-text-primary)', fontSize: '11px' }}>
                <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L706.uuid}
                  type="checkbox"
                  checked={selectedComponentTypes.size === ALL_ELEMENT_TAGS.length}
                  onChange={selectAllComponents}
                  style={{ cursor: 'pointer' }}
                />
                اختيار الكل
              </label>
              <label data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L714.uuid} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--gova-component-dev-ui-text-primary)', fontSize: '11px' }}>
                <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L715.uuid}
                  type="checkbox"
                  checked={selectedComponentTypes.size === 0}
                  onChange={deselectAllComponents}
                  style={{ cursor: 'pointer' }}
                />
                إلغاء الكل
              </label>
            </div>
          </div>
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L725.uuid} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {ALL_ELEMENT_TAGS.map((type) => (
              <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L727.uuid}
                key={type}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: selectedComponentTypes.has(type) ? 'var(--gova-component-dev-ui-success)' : 'transparent',
                }}
              >
                <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L738.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L739.uuid} style={{ color: 'var(--gova-component-dev-ui-text-primary)' }}>{type}</span>
                </div>
                <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L741.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isFilterPanelOpen && (
                    <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L743.uuid} style={{ color: 'var(--gova-component-dev-ui-text-secondary)', fontSize: '10px' }}>
                      {(componentCounts[type] || 0) > 99 ? '99+' : (componentCounts[type] || 0)}
                    </span>
                  )}
                  <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L747.uuid}
                    onClick={() => toggleComponentFilter(type)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 600,
                      background: selectedComponentTypes.has(type) ? 'var(--gova-component-dev-ui-success)' : 'var(--gova-component-dev-ui-secondary)',
                      color: 'var(--gova-on-primary)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {selectedComponentTypes.has(type) ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frames overlay */}
      {/* Show all frames only when filter panel is open */}
      {isFilterPanelOpen && frames.map((frame, i) => {
        const colors = COLOR_MAP[frame.color];
        const isHovered = hoveredFrame && hoveredFrame.id === frame.id;
        return (
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L776.uuid} key={`${frame.id}-${i}`} data-inspector-overlay="true" style={{
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
    }}>
            <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L788.uuid}
              style={{
                position: 'absolute',
                top: -1,
                left: 0,
                background: colors.badge,
                color: 'var(--gova-on-primary)',
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
      
      {/* Show only hovered frame when Hover is ON */}
      {isHoverInspectionEnabled && hoveredFrame && (
        <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L815.uuid} key={`hovered-${hoveredFrame.id}`} data-inspector-overlay="true" style={{
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
    }}>
          <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L827.uuid}
            style={{
              position: 'absolute',
              top: -1,
              left: 0,
              background: COLOR_MAP[hoveredFrame.color].badge,
              color: 'var(--gova-on-primary)',
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
        </div>
      )}

      {/* Tooltip - Only closes on ✕ button click */}
      {tooltip.visible && (
        <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L853.uuid} key={tooltip.instanceId} data-tooltip="true" onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
 style={{
        position: 'fixed',
        top: Math.min(tooltip.y, 20),
        left: Math.min(tooltip.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 380),
        zIndex: 100000,
        background: 'var(--gova-component-dev-ui-bg-dark)',
        border: '1px solid var(--gova-component-dev-ui-border-light)',
        borderRadius: '10px',
        padding: '14px 16px',
        boxShadow: 'var(--gova-component-dev-ui-shadow-3)',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: 'var(--gova-component-dev-ui-text-primary)',
        minWidth: '340px',
        maxWidth: '380px',
        maxHeight: '80vh',
        overflowY: 'auto',
        lineHeight: 1.6,
        pointerEvents: 'auto',
    }}>
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L874.uuid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L875.uuid} style={{ color: 'var(--gova-component-dev-ui-primary-light)', fontWeight: 700, fontSize: '13px' }}>
              UI Identity Inspector
            </div>
            <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L878.uuid}
              onClick={(e) => {
                e.stopPropagation();
                dismissTooltip();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gova-component-dev-ui-text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
          
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L896.uuid} style={{ marginBottom: '12px' }}>
            <Row label="Stable ID" value={tooltip.id} color="var(--gova-component-dev-ui-accent-purple)" />
            <Row label="UUID" value={tooltip.uuid} color="var(--gova-component-dev-ui-text-secondary)" />
            {tooltip.uiInstanceId && <Row label="Instance" value={tooltip.uiInstanceId} color="var(--gova-component-dev-ui-text-secondary)" />}
            <Row label="Identity Key" value={tooltip.identityKey} color="var(--gova-component-dev-ui-text-secondary)" />
            <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L901.uuid} style={{ display: 'flex', gap: '6px', marginTop: '6px', marginBottom: '6px' }}>
              <CopyButton value={tooltip.uuid} label="Copy UUID" />
              <CopyButton value={tooltip.identityKey} label="Copy Key" />
            </div>
            <Row label="Path" value={tooltip.path} color="var(--gova-component-dev-ui-accent-green)" />
            <Row label="Feature" value={tooltip.feature} color="var(--gova-component-dev-ui-accent-amber)" />
            <Row label="Version" value={tooltip.version} color="var(--gova-component-dev-ui-text-secondary)" />
            {tooltip.deprecated && (
              <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L909.uuid} style={{ color: 'var(--gova-component-dev-ui-error)', marginTop: '4px', fontWeight: 600 }}>⚠ DEPRECATED</div>
            )}
          </div>

          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L913.uuid} style={{ borderTop: '1px solid var(--gova-component-dev-ui-border-color)', marginTop: '8px', paddingTop: '8px' }}>
            <Row label="Component" value={tooltip.sourceComponent} color="var(--gova-component-dev-ui-accent-pink)" />
            <Row label="File" value={tooltip.sourceFile} color="var(--gova-component-dev-ui-text-secondary)" />
            {tooltip.sourceLine > 0 && <Row label="Line" value={String(tooltip.sourceLine)} color="var(--gova-component-dev-ui-text-secondary)" />}
          </div>

          {/* Children Section */}
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L920.uuid} style={{ borderTop: '1px solid var(--gova-component-dev-ui-border-color)', marginTop: '12px', paddingTop: '12px' }}>
            <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L921.uuid} style={{ marginBottom: '8px' }}>
              <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L922.uuid} style={{ color: 'var(--gova-component-dev-ui-accent-purple)', fontWeight: 600, fontSize: '12px' }}>العناصر الأبن</span>
            </div>
            {currentChildren.length === 0 ? (
              <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L925.uuid} style={{ color: 'var(--gova-component-dev-ui-text-muted)', fontSize: '10px', fontStyle: 'italic', padding: '8px 0' }}>
                لا يوجد عناصر أبن
              </div>
            ) : (
              <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L929.uuid} style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                {currentChildren.map((child, index) => (
                  <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L931.uuid} 
                    key={`${child.identityKey}_${index}`}
                    style={{
                      background: 'var(--gova-component-dev-ui-bg-darker)',
                      border: '1px solid var(--gova-component-dev-ui-border-color)',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={() => {
                      // Show hover frame on child
                      const el = document.querySelector(`[data-ui-identity-key="${child.identityKey}"]`) as HTMLElement | null;
                      if (!el) return;
                      const rect = el.getBoundingClientRect();
                      const identity = getUiIdentityByUuid(child.id);
                      let color: 'blue' | 'amber' | 'red' = 'red';
                      if (identity) {
                        color = getUiIdentityLifecycle(identity) === 'deprecated' ? 'amber' : 'blue';
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
                      const el = document.querySelector(`[data-ui-identity-key="${child.identityKey}"]`) as HTMLElement | null;
                      if (!el) return;
                      const identity = getUiIdentityByUuid(child.id);
                      const childUuid = identity ? getUiIdentityUuid(identity) : el.getAttribute('data-ui-uuid') || '';
                      const source = UI_SOURCE_INDEX_BY_UUID[childUuid];
                      const childInstanceId = el.getAttribute('data-ui-instance-id') || '';
                      const childIdentityKey = el.getAttribute('data-ui-identity-key') || childUuid;
                      const savedData = getInspectorData(allInspectorData, child.id, childIdentityKey, identity);
                      const rect = el.getBoundingClientRect();

                      setTooltip({
                        visible: true,
                        x: rect.left + rect.width + 12,
                        y: rect.top,
                        uuid: childUuid,
                        uiInstanceId: childInstanceId,
                        identityKey: childIdentityKey,
                        id: child.id,
                        instanceId: `${child.id}_${Date.now()}`,
                        path: identity?.path || '—',
                        feature: identity?.feature || '—',
                        version: identity?.version || '—',
                        deprecated: identity ? getUiIdentityLifecycle(identity) === 'deprecated' : false,
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
                        dataUiUuid: savedData?.dataUiUuid || childUuid,
                        dataUiInstanceId: savedData?.dataUiInstanceId || childInstanceId,
                        dataUiIdentityKey: savedData?.dataUiIdentityKey || childIdentityKey,
                      });
                    }}
                  >
                    <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1010.uuid} style={{ color: 'var(--gova-component-dev-ui-text-primary)', fontSize: '11px', fontWeight: 500 }}>
                      {child.id}
                    </div>
                    <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1013.uuid} style={{ color: 'var(--gova-component-dev-ui-text-muted)', fontSize: '10px', marginTop: '2px' }}>
                      {child.componentType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Database Section */}
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1023.uuid} style={{ borderTop: '1px solid var(--gova-component-dev-ui-border-color)', marginTop: '12px', paddingTop: '12px' }}>
            <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1024.uuid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1025.uuid} style={{ color: 'var(--gova-component-dev-ui-primary-light)', fontWeight: 600, fontSize: '12px' }}>Database</span>
              <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1026.uuid}
                onClick={() => setTooltip(t => ({ ...t, databaseEnabled: !t.databaseEnabled }))}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: tooltip.databaseEnabled ? 'var(--gova-component-dev-ui-success)' : 'var(--gova-component-dev-ui-secondary)',
                  color: 'var(--gova-on-primary)',
                  fontFamily: 'monospace',
                }}
              >
                {tooltip.databaseEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Database Inputs (only if enabled) */}
            {tooltip.databaseEnabled && (
              <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1046.uuid} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1047.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1048.uuid} style={{ color: 'var(--gova-component-dev-ui-text-secondary)', fontSize: '11px', minWidth: '40px' }}>inf1</span>
                  <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1049.uuid}
                    type="text"
                    value={tooltip.inf1}
                    onChange={(e) => setTooltip(t => ({ ...t, inf1: e.target.value }))}
                    style={{
                      flex: 1,
                      background: 'var(--gova-component-dev-ui-bg-darker)',
                      border: '1px solid var(--gova-component-dev-ui-border-color)',
                      borderRadius: '6px',
                      padding: '8px',
                      color: 'var(--gova-component-dev-ui-text-primary)',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1066.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1067.uuid} style={{ color: 'var(--gova-component-dev-ui-text-secondary)', fontSize: '11px', minWidth: '40px' }}>inf2</span>
                  <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1068.uuid}
                    type="text"
                    value={tooltip.inf2}
                    onChange={(e) => setTooltip(t => ({ ...t, inf2: e.target.value }))}
                    style={{
                      flex: 1,
                      background: 'var(--gova-component-dev-ui-bg-darker)',
                      border: '1px solid var(--gova-component-dev-ui-border-color)',
                      borderRadius: '6px',
                      padding: '8px',
                      color: 'var(--gova-component-dev-ui-text-primary)',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1085.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1086.uuid} style={{ color: 'var(--gova-component-dev-ui-text-secondary)', fontSize: '11px', minWidth: '40px' }}>inf3</span>
                  <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1087.uuid}
                    type="text"
                    value={tooltip.inf3}
                    onChange={(e) => setTooltip(t => ({ ...t, inf3: e.target.value }))}
                    style={{
                      flex: 1,
                      background: 'var(--gova-component-dev-ui-bg-darker)',
                      border: '1px solid var(--gova-component-dev-ui-border-color)',
                      borderRadius: '6px',
                      padding: '8px',
                      color: 'var(--gova-component-dev-ui-text-primary)',
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
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1109.uuid} style={{ borderTop: '1px solid var(--gova-component-dev-ui-border-color)', marginTop: '12px', paddingTop: '12px' }}>
            <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1110.uuid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1111.uuid} style={{ color: 'var(--gova-component-dev-ui-accent-pink)', fontWeight: 600, fontSize: '12px' }}>Attributes</span>
              <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1112.uuid}
                onClick={() => setTooltip(t => ({ ...t, attributesEnabled: !t.attributesEnabled }))}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: tooltip.attributesEnabled ? 'var(--gova-component-dev-ui-success)' : 'var(--gova-component-dev-ui-secondary)',
                  color: 'var(--gova-on-primary)',
                  fontFamily: 'monospace',
                }}
              >
                {tooltip.attributesEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Attributes Checkboxes (only if enabled) */}
            {tooltip.attributesEnabled && (
              <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1132.uuid} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1133.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1134.uuid}
                    type="checkbox"
                    checked={tooltip.attribute1}
                    onChange={(e) => setTooltip(t => ({ ...t, attribute1: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1140.uuid} style={{ color: 'var(--gova-component-dev-ui-text-secondary)', fontSize: '11px' }}>Attribute 1</span>
                </label>
                <label data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1142.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1143.uuid}
                    type="checkbox"
                    checked={tooltip.attribute2}
                    onChange={(e) => setTooltip(t => ({ ...t, attribute2: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1149.uuid} style={{ color: 'var(--gova-component-dev-ui-text-secondary)', fontSize: '11px' }}>Attribute 2</span>
                </label>
                <label data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1151.uuid} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1152.uuid}
                    type="checkbox"
                    checked={tooltip.attribute3}
                    onChange={(e) => setTooltip(t => ({ ...t, attribute3: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1158.uuid} style={{ color: 'var(--gova-component-dev-ui-text-secondary)', fontSize: '11px' }}>Attribute 3</span>
                </label>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1165.uuid} style={{ marginTop: '12px' }}>
            <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1166.uuid} onClick={handleSave} disabled={isSaving} style={{
        width: '100%',
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: isSaving ? 'not-allowed' : 'pointer',
        background: saveStatus === 'saved'
            ? 'var(--gova-component-dev-ui-success)'
            : saveStatus === 'error'
                ? 'var(--gova-component-dev-ui-error)'
                : 'var(--gova-component-dev-ui-primary)',
        color: 'var(--gova-on-primary)',
        transition: 'all 0.2s',
        fontFamily: 'monospace',
    }}>
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
    <div data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1200.uuid} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
      <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1201.uuid} style={{ color: 'var(--gova-component-dev-ui-secondary)', minWidth: '70px' }}>{label}:</span>
      <span data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1202.uuid} style={{ color, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <button data-ui-uuid={DEVTOOLS.SHELL.DEV_UI_OVERLAY_L1209.uuid}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (value) {
          void navigator.clipboard?.writeText(value);
        }
      }}
      style={{
        background: 'var(--gova-component-dev-ui-bg-darker)',
        border: '1px solid var(--gova-component-dev-ui-border-color)',
        borderRadius: '4px',
        color: 'var(--gova-component-dev-ui-text-secondary)',
        cursor: 'pointer',
        fontSize: '10px',
        lineHeight: 1,
        padding: '5px 7px',
      }}
      title={label}
    >
      {label}
    </button>
  );
}
