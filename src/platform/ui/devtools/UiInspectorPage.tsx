'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from '@/platform/ui';
import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import {
  emptyDatabaseRefFile,
  findDatabase,
  findTable,
  type DatabaseRefFile,
} from './database-ref-types';
import { DatabaseRefEditor } from './DatabaseRefEditor';
import { buildAbsoluteInspectUrl, buildInspectUrl, INSPECTOR_ROUTES, type InspectorRoutePath } from './inspector-routes';
import {
  isUiInspectorFrameMessage,
  postToInspectorFrame,
  UI_INSPECTOR_CHANNEL,
  type InspectElementSnapshot,
} from './UiInspectorFrameBridge';

const LIFECYCLE_FILTERS = [
  { value: 'all', label: 'All lifecycles' },
  { value: 'active', label: 'Active' },
  { value: 'deprecated', label: 'Deprecated' },
] as const;

const TAG_FILTERS = [
  'all',
  'button',
  'input',
  'a',
  'div',
  'span',
  'section',
  'header',
  'main',
  'nav',
  'h1',
  'h2',
  'h3',
  'p',
  'form',
  'label',
  'img',
] as const;

const SIDEBAR_WIDTH_KEY = 'ui-inspector-sidebar-width';
const PICK_MODE_KEY = 'ui-inspector-pick-mode';
const PREVIEW_SIZE_KEY = 'ui-inspector-preview-size';
const DEFAULT_SIDEBAR_WIDTH = 380;
const DEFAULT_PREVIEW_WIDTH = 390;
const DEFAULT_PREVIEW_HEIGHT = 844;
const DEFAULT_PREVIEW_SCALE = 1;
const RESIZER_WIDTH = 6;
const MIN_PANEL_SIZE = 1;

type SidebarSection = 'route' | 'display' | 'database' | 'attributes' | 'filters' | 'list' | 'details';

interface InspectorDataEntry {
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
  updatedAt?: string;
}

type InspectorDataMap = Record<string, InspectorDataEntry>;

interface ElementFormState {
  databaseEnabled: boolean;
  inf1: string;
  inf2: string;
  inf3: string;
  attributesEnabled: boolean;
  attribute1: boolean;
  attribute2: boolean;
  attribute3: boolean;
}

interface PreviewSizeState {
  width: number;
  height: number;
  scale: number;
}

function copyText(value: string): void {
  if (!value) return;
  void navigator.clipboard.writeText(value);
}

function sectionChevron(open: boolean): string {
  return open ? ' [v]' : ' [>]';
}

function formatScanTime(date: Date | null): string {
  if (!date) return 'never';
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function emptyDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function readSidebarWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH;
  const saved = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
  const parsed = saved ? Number(saved) : DEFAULT_SIDEBAR_WIDTH;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SIDEBAR_WIDTH;
  return parsed;
}

function clampSidebarWidth(width: number, viewportWidth: number): number {
  const maxWidth = Math.max(MIN_PANEL_SIZE, viewportWidth - RESIZER_WIDTH - MIN_PANEL_SIZE);
  return Math.max(MIN_PANEL_SIZE, Math.min(maxWidth, width));
}

function readPreviewSize(): PreviewSizeState {
  if (typeof window === 'undefined') {
    return {
      width: DEFAULT_PREVIEW_WIDTH,
      height: DEFAULT_PREVIEW_HEIGHT,
      scale: DEFAULT_PREVIEW_SCALE,
    };
  }
  try {
    const saved = window.localStorage.getItem(PREVIEW_SIZE_KEY);
    if (!saved) {
      return {
        width: DEFAULT_PREVIEW_WIDTH,
        height: DEFAULT_PREVIEW_HEIGHT,
        scale: DEFAULT_PREVIEW_SCALE,
      };
    }
    const parsed = JSON.parse(saved) as Partial<PreviewSizeState>;
    return {
      width:
        typeof parsed.width === 'number' && parsed.width > 0
          ? parsed.width
          : DEFAULT_PREVIEW_WIDTH,
      height:
        typeof parsed.height === 'number' && parsed.height > 0
          ? parsed.height
          : DEFAULT_PREVIEW_HEIGHT,
      scale:
        typeof parsed.scale === 'number' && parsed.scale > 0
          ? parsed.scale
          : DEFAULT_PREVIEW_SCALE,
    };
  } catch {
    return {
      width: DEFAULT_PREVIEW_WIDTH,
      height: DEFAULT_PREVIEW_HEIGHT,
      scale: DEFAULT_PREVIEW_SCALE,
    };
  }
}

function persistPreviewSize(size: PreviewSizeState): void {
  window.localStorage.setItem(PREVIEW_SIZE_KEY, JSON.stringify(size));
}

function clampPreviewDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_PANEL_SIZE;
  return Math.max(MIN_PANEL_SIZE, value);
}

function clampPreviewScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PREVIEW_SCALE;
  return Math.max(MIN_PANEL_SIZE / 100, value);
}

function readPickModeEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = window.localStorage.getItem(PICK_MODE_KEY);
  return saved === null ? true : saved === 'true';
}

function getStorageKey(el: InspectElementSnapshot): string {
  const instanceId = el.instanceId ?? '';
  return instanceId ? `${el.uuid}:${instanceId}` : el.uuid;
}

function getInspectorData(
  data: InspectorDataMap,
  el: InspectElementSnapshot
): InspectorDataEntry | undefined {
  const storageKey = getStorageKey(el);
  return data[storageKey] || data[el.uuid] || (el.id ? data[el.id] : undefined);
}

function emptyFormState(): ElementFormState {
  return {
    databaseEnabled: false,
    inf1: '',
    inf2: '',
    inf3: '',
    attributesEnabled: false,
    attribute1: false,
    attribute2: false,
    attribute3: false,
  };
}

export function DevToolsInspectorPage() {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sidebarWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  const draggingRef = useRef(false);

  const [routePath, setRoutePath] = useState<InspectorRoutePath>('/home');
  const [iframeKey, setIframeKey] = useState(0);
  const [elements, setElements] = useState<InspectElementSnapshot[]>([]);
  const [selectedScanKey, setSelectedScanKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [featureFilter, setFeatureFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [lifecycleFilter, setLifecycleFilter] = useState('all');
  const [missingSourceOnly, setMissingSourceOnly] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [previewSize, setPreviewSize] = useState<PreviewSizeState>({
    width: DEFAULT_PREVIEW_WIDTH,
    height: DEFAULT_PREVIEW_HEIGHT,
    scale: DEFAULT_PREVIEW_SCALE,
  });
  const [pickModeEnabled, setPickModeEnabled] = useState(true);
  const [allInspectorData, setAllInspectorData] = useState<InspectorDataMap>({});
  const [formState, setFormState] = useState<ElementFormState>(emptyFormState);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [refSaveStatus, setRefSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [databaseRef, setDatabaseRef] = useState<DatabaseRefFile>(emptyDatabaseRefFile());
  const [databaseRefDraft, setDatabaseRefDraft] = useState<DatabaseRefFile>(emptyDatabaseRefFile());
  const [databasePanelPinned, setDatabasePanelPinned] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<Record<SidebarSection, boolean>>({
    route: false,
    display: false,
    database: false,
    attributes: false,
    filters: false,
    list: false,
    details: false,
  });

  const iframeSrc = useMemo(() => buildInspectUrl(routePath), [routePath, iframeKey]);

  const targetUrl = useMemo(() => {
    if (typeof window === 'undefined') return iframeSrc;
    return buildAbsoluteInspectUrl(routePath, window.location.origin);
  }, [routePath, iframeSrc]);

  const markIframeLoading = useCallback(() => {
    setIframeReady(false);
    setLastScanTime(null);
  }, []);

  useEffect(() => {
    const initialSidebar = clampSidebarWidth(readSidebarWidth(), window.innerWidth);
    setSidebarWidth(initialSidebar);
    setPreviewSize(readPreviewSize());
    setPickModeEnabled(readPickModeEnabled());
  }, []);

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [inspectorResponse, refResponse] = await Promise.all([
          fetch('/api/ui-inspector'),
          fetch('/api/database-ref'),
        ]);
        if (inspectorResponse.ok) {
          const data = (await inspectorResponse.json()) as InspectorDataMap;
          setAllInspectorData(data);
        }
        if (refResponse.ok) {
          const refData = (await refResponse.json()) as DatabaseRefFile;
          setDatabaseRef(refData);
          setDatabaseRefDraft(refData);
        }
      } catch {
        /* ignore load errors in devtools */
      }
    };
    void loadData();
  }, []);

  const featureOptions = useMemo(() => {
    const features = new Set(elements.map((el) => el.feature).filter(Boolean));
    return ['all', ...Array.from(features).sort()];
  }, [elements]);

  const filteredElements = useMemo(() => {
    const query = search.trim().toLowerCase();
    return elements.filter((el) => {
      if (featureFilter !== 'all' && el.feature !== featureFilter) return false;
      if (tagFilter !== 'all' && el.tagName !== tagFilter) return false;
      if (lifecycleFilter !== 'all' && el.lifecycle !== lifecycleFilter) return false;
      if (missingSourceOnly && el.hasSource) return false;
      if (!query) return true;
      return (
        el.uuid.toLowerCase().includes(query) ||
        el.id.toLowerCase().includes(query) ||
        el.path.toLowerCase().includes(query) ||
        el.feature.toLowerCase().includes(query)
      );
    });
  }, [elements, search, featureFilter, tagFilter, lifecycleFilter, missingSourceOnly]);

  const selected = useMemo(
    () =>
      filteredElements.find((el) => el.scanKey === selectedScanKey) ??
      elements.find((el) => el.scanKey === selectedScanKey) ??
      null,
    [filteredElements, elements, selectedScanKey]
  );

  const toggleSection = (section: SidebarSection) => {
    if (section === 'database' && databasePanelPinned && expanded.database) {
      return;
    }
    setExpanded((current) => ({ ...current, [section]: !current[section] }));
  };

  const selectElement = useCallback((scanKey: string) => {
    setSelectedScanKey(scanKey);
  }, []);

  const sendPickMode = useCallback((enabled: boolean) => {
    postToInspectorFrame(
      iframeRef.current,
      { channel: UI_INSPECTOR_CHANNEL, type: 'SET_PICK_MODE', enabled },
      window.location.origin
    );
  }, []);

  const requestScan = useCallback(() => {
    postToInspectorFrame(
      iframeRef.current,
      { channel: UI_INSPECTOR_CHANNEL, type: 'REQUEST_SCAN' },
      window.location.origin
    );
  }, []);

  const sendHighlight = useCallback((scanKey: string) => {
    postToInspectorFrame(
      iframeRef.current,
      { channel: UI_INSPECTOR_CHANNEL, type: 'HIGHLIGHT', scanKey },
      window.location.origin
    );
  }, []);

  const sendScroll = useCallback((scanKey: string) => {
    postToInspectorFrame(
      iframeRef.current,
      { channel: UI_INSPECTOR_CHANNEL, type: 'SCROLL', scanKey },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isUiInspectorFrameMessage(event.data)) return;

      if (event.data.type === 'SCAN_RESULT') {
        const scanned = event.data.elements;
        setElements(scanned);
        setLastScanTime(new Date());
        setSelectedScanKey((current) =>
          current && scanned.some((el: InspectElementSnapshot) => el.scanKey === current) ? current : null
        );
      }

      if (event.data.type === 'READY') {
        setIframeReady(true);
        sendPickMode(pickModeEnabled);
        requestScan();
      }

      if (event.data.type === 'ELEMENT_PICKED') {
        selectElement(event.data.scanKey);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [selectElement, pickModeEnabled, requestScan, sendPickMode]);

  useEffect(() => {
    if (selectedScanKey) sendHighlight(selectedScanKey);
  }, [selectedScanKey, sendHighlight, iframeKey]);

  useEffect(() => {
    if (!iframeReady) return;
    sendPickMode(pickModeEnabled);
  }, [pickModeEnabled, sendPickMode, iframeReady]);

  useEffect(() => {
    if (!selected) {
      setFormState(emptyFormState());
      setDatabasePanelPinned(false);
      return;
    }
    const saved = getInspectorData(allInspectorData, selected);
    setFormState({
      databaseEnabled: saved?.databaseEnabled ?? false,
      inf1: saved?.inf1 ?? '',
      inf2: saved?.inf2 ?? '',
      inf3: saved?.inf3 ?? '',
      attributesEnabled: saved?.attributesEnabled ?? false,
      attribute1: saved?.attribute1 ?? false,
      attribute2: saved?.attribute2 ?? false,
      attribute3: saved?.attribute3 ?? false,
    });
    setDatabasePanelPinned(false);
    setExpanded((current) => ({
      ...current,
      display: Boolean(saved?.updatedAt),
      database: Boolean(saved?.databaseEnabled),
      attributes: Boolean(saved?.attributesEnabled),
    }));
    setSaveStatus('idle');
  }, [selected, allInspectorData]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = clampSidebarWidth(event.clientX, window.innerWidth);
      setSidebarWidth(next);
    };

    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidthRef.current));
    };

    const onWindowResize = () => {
      setSidebarWidth((current) => clampSidebarWidth(current, window.innerWidth));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const handleRefresh = () => {
    setElements([]);
    setSelectedScanKey(null);
    markIframeLoading();
    setIframeKey((key) => key + 1);
  };

  const handleRouteChange = (nextRoute: InspectorRoutePath) => {
    setRoutePath(nextRoute);
    setSelectedScanKey(null);
    setElements([]);
    markIframeLoading();
  };

  const openTargetInNewTab = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleResizeStart = () => {
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handlePickModeToggle = () => {
    setPickModeEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(PICK_MODE_KEY, String(next));
      return next;
    });
  };

  const selectedDatabase = useMemo(
    () => findDatabase(databaseRef, formState.inf1),
    [databaseRef, formState.inf1]
  );
  const tableOptions = selectedDatabase?.tables ?? [];
  const selectedTable = useMemo(
    () => findTable(selectedDatabase, formState.inf2),
    [selectedDatabase, formState.inf2]
  );
  const columnOptions = selectedTable?.columns ?? [];

  const handleDatabaseToggle = () => {
    setFormState((current) => {
      const nextEnabled = !current.databaseEnabled;
      if (nextEnabled) {
        setDatabasePanelPinned(true);
        setExpanded((expandedState) => ({ ...expandedState, database: true }));
      }
      return { ...current, databaseEnabled: nextEnabled };
    });
  };

  const handleSaveDatabaseRef = async () => {
    setRefSaveStatus('saving');
    try {
      const response = await fetch('/api/database-ref', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(databaseRefDraft),
      });
      if (!response.ok) throw new Error('schema save failed');
      setDatabaseRef(databaseRefDraft);
      setRefSaveStatus('saved');
      window.setTimeout(() => setRefSaveStatus('idle'), 2000);
    } catch {
      setRefSaveStatus('error');
      window.setTimeout(() => setRefSaveStatus('idle'), 2000);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    if (
      !window.confirm(
        'Save inspector settings for the selected element? This writes to ui-inspector-data.json.'
      )
    ) {
      return;
    }
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/ui-inspector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uiUuid: selected.uuid,
          uiInstanceId: selected.instanceId ?? '',
          databaseEnabled: formState.databaseEnabled,
          inf1: formState.inf1,
          inf2: formState.inf2,
          inf3: formState.inf3,
          attributesEnabled: formState.attributesEnabled,
          attribute1: formState.attribute1,
          attribute2: formState.attribute2,
          attribute3: formState.attribute3,
        }),
      });
      if (!response.ok) throw new Error('save failed');
      const storageKey = getStorageKey(selected);
      setAllInspectorData((current) => ({
        ...current,
        [storageKey]: {
          databaseEnabled: formState.databaseEnabled,
          inf1: formState.inf1,
          inf2: formState.inf2,
          inf3: formState.inf3,
          attributesEnabled: formState.attributesEnabled,
          attribute1: formState.attribute1,
          attribute2: formState.attribute2,
          attribute3: formState.attribute3,
          dataUiPath: selected.path,
          dataUiFeature: selected.feature,
          dataUiUuid: selected.uuid,
          dataUiInstanceId: selected.instanceId ?? '',
          dataUiIdentityKey: storageKey,
          updatedAt: new Date().toISOString(),
        },
      }));
      setSaveStatus('saved');
      setDatabasePanelPinned(false);
      window.setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      window.setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const sourceLocation = selected
    ? `${selected.sourceFile}:${selected.sourceLine} (${selected.sourceComponent})`
    : '';

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : 'Save data';

  const previewFrameWidth = previewSize.width * previewSize.scale;
  const previewFrameHeight = previewSize.height * previewSize.scale;
  const previewZoomPercent = Math.round(previewSize.scale * 100);

  const updatePreviewSize = (patch: Partial<PreviewSizeState>) => {
    setPreviewSize((current) => {
      const next = {
        width: patch.width === undefined ? current.width : clampPreviewDimension(patch.width),
        height: patch.height === undefined ? current.height : clampPreviewDimension(patch.height),
        scale: patch.scale === undefined ? current.scale : clampPreviewScale(patch.scale),
      };
      persistPreviewSize(next);
      return next;
    });
  };

  return (
    <div
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PAGE.CONTAINER.uuid}
      className="flex h-screen flex-col overflow-hidden bg-surface text-on-surface"
    >
      <div
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.WORKSPACE.CONTAINER.uuid}
        dir="ltr"
        className="flex min-h-0 flex-1 flex-row"
      >
        <aside
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.CONTAINER.uuid}
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
          className="h-full min-h-0 shrink-0 overflow-auto border-e border-outline-variant bg-surface [&>*]:min-w-[280px]"
        >
          <section
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.CONTAINER.uuid}
            className="flex shrink-0 items-center justify-between gap-2 border-b border-outline-variant px-3 py-2"
          >
            <h1
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.TITLE.uuid}
              className="text-base font-semibold"
            >
              UI Inspector
            </h1>
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PICK.MODE_TOGGLE.uuid}
              type="button"
              onClick={handlePickModeToggle}
              className={`rounded px-2 py-1 text-xs font-medium ${
                pickModeEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
              }`}
            >
              Pick {pickModeEnabled ? 'ON' : 'OFF'}
            </button>
          </section>

          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('route')}
            className="flex w-full shrink-0 items-center border-b border-outline-variant px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant"
          >
            Target page{sectionChevron(expanded.route)}
          </button>
          {expanded.route && (
            <>
              <select
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_SELECT.uuid}
                value={routePath}
                onChange={(e) => handleRouteChange(e.target.value as InspectorRoutePath)}
                className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
              >
                {INSPECTOR_ROUTES.map((route) => (
                  <option
                    key={route.path}
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_OPTION.uuid}
                    data-ui-instance-id={`route-${route.path}`}
                    value={route.path}
                  >
                    {route.label} ({route.path})
                  </option>
                ))}
              </select>
              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.REFRESH_BUTTON.uuid}
                type="button"
                onClick={handleRefresh}
                className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded bg-primary px-3 py-1.5 text-sm text-on-primary"
              >
                Refresh preview
              </button>
              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.OPEN_TAB_BUTTON.uuid}
                type="button"
                onClick={openTargetInNewTab}
                className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-3 py-1.5 text-sm"
              >
                Open target in new tab
              </button>
            </>
          )}

          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DISPLAY_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('display')}
            className="flex w-full shrink-0 items-center border-b border-outline-variant px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant"
          >
            Display{sectionChevron(expanded.display)}
          </button>
          {expanded.display && (
            <>
              {!selected ? (
                <code
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.CONTAINER.uuid}
                  data-ui-instance-id="display-empty"
                  className="block border-b border-outline-variant px-3 pb-3 text-sm text-on-surface-variant"
                >
                  Select an element from the preview or list.
                </code>
              ) : (
                <section
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SELECTED.CONTAINER.uuid}
                  className="shrink-0 border-b border-outline-variant bg-surface-variant/40 px-3 py-3"
                >
                  <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.STABLE_ID_LABEL.uuid} className="text-xs font-medium">
                    {t(DEVTOOLS.UI_INSPECTOR.DETAILS.STABLE_ID_LABEL)}
                  </span>
                  <code
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.STABLE_ID_VALUE.uuid}
                    className="mt-0.5 block break-all text-sm font-semibold"
                  >
                    {selected.id || selected.uuid.slice(0, 8)}
                  </code>
                  <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.PATH_LABEL.uuid} className="mt-2 text-xs font-medium">
                    {t(DEVTOOLS.UI_INSPECTOR.DETAILS.PATH_LABEL)}
                  </span>
                  <code
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.PATH_VALUE.uuid}
                    className="mt-0.5 block break-all text-xs text-on-surface-variant"
                  >
                    {selected.path || '-'}
                  </code>
                  <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TAG_LABEL.uuid} className="mt-2 text-xs font-medium">
                    {t(DEVTOOLS.UI_INSPECTOR.DETAILS.TAG_LABEL)}
                  </span>
                  <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TAG_VALUE.uuid} className="mt-0.5 block text-xs">
                    {selected.tagName} | {selected.feature} | {selected.lifecycle}
                  </code>
                  <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.UUID_LABEL.uuid} className="mt-2 text-xs font-medium">
                    {t(DEVTOOLS.UI_INSPECTOR.DETAILS.UUID_LABEL)}
                  </span>
                  <code
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.UUID_VALUE.uuid}
                    className="mt-0.5 block break-all text-[10px] text-on-surface-variant"
                  >
                    {selected.uuid}
                  </code>
                </section>
              )}
              <section
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.CONTAINER.uuid}
                data-ui-instance-id="status-bar"
                className="space-y-1 border-b border-outline-variant px-3 py-2 text-[11px]"
              >
                <code
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.IFRAME_VALUE.uuid}
                  className="block break-all text-on-surface-variant"
                >
                  iframe: {iframeReady ? 'ready' : 'loading'}
                </code>
                <code
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.SCAN_VALUE.uuid}
                  className="block break-all text-on-surface-variant"
                >
                  last scan: {formatScanTime(lastScanTime)}
                </code>
                <code
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.COUNT_VALUE.uuid}
                  className="block break-all text-on-surface-variant"
                >
                  elements: {elements.length}
                </code>
                <code
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.URL_VALUE.uuid}
                  className="block break-all text-on-surface-variant"
                >
                  url: {targetUrl}
                </code>
              </section>
            </>
          )}

          {selected && (
            <>
              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DATABASE_SECTION_LABEL.uuid}
                type="button"
                onClick={() => toggleSection('database')}
                className="flex w-full shrink-0 items-center border-b border-outline-variant px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant"
              >
                Database
                {databasePanelPinned ? ' (unsaved)' : ''}
                {sectionChevron(expanded.database)}
              </button>
              {expanded.database && (
                <section
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.CONTAINER.uuid}
                  data-ui-instance-id="database-panel"
                  className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 border-b border-outline-variant px-3 py-3"
                >
                  <span
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
                    className="self-center text-xs font-medium"
                  >
                    Database
                  </span>
                  <button
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_TOGGLE.uuid}
                    type="button"
                    onClick={handleDatabaseToggle}
                    className={`rounded px-2 py-0.5 text-xs ${
                      formState.databaseEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
                    }`}
                  >
                    {formState.databaseEnabled ? 'ON' : 'OFF'}
                  </button>
                  {formState.databaseEnabled && (
                    <>
                      <select
                        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_INPUT.uuid}
                        value={formState.inf1}
                        onChange={(e) =>
                          setFormState((current) => ({
                            ...current,
                            inf1: e.target.value,
                            inf2: '',
                            inf3: '',
                          }))
                        }
                        className="col-span-2 w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
                      >
                        {[
                          { value: '', label: 'Select database...' },
                          ...databaseRef.databases.map((db) => ({
                            value: db.name_en,
                            label: `${db.name_en} (${db.name_ar})`,
                          })),
                        ].map((item) => (
                          <option
                            key={item.value || 'empty-db'}
                            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_LABEL.uuid}
                            data-ui-instance-id={`element-db-${item.value || 'empty'}`}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <select
                        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_INPUT.uuid}
                        value={formState.inf2}
                        disabled={!formState.inf1}
                        onChange={(e) =>
                          setFormState((current) => ({
                            ...current,
                            inf2: e.target.value,
                            inf3: '',
                          }))
                        }
                        className="col-span-2 w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {[
                          { value: '', label: 'Select table...' },
                          ...tableOptions.map((table) => ({
                            value: table.name_en,
                            label: `${table.name_en} (${table.name_ar})`,
                          })),
                        ].map((item) => (
                          <option
                            key={item.value || 'empty-table'}
                            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
                            data-ui-instance-id={`element-table-${item.value || 'empty'}`}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <select
                        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_INPUT.uuid}
                        value={formState.inf3}
                        disabled={!formState.inf2}
                        onChange={(e) =>
                          setFormState((current) => ({ ...current, inf3: e.target.value }))
                        }
                        className="col-span-2 w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {[
                          { value: '', label: 'Select column...' },
                          ...columnOptions.map((column) => ({
                            value: column.name_en,
                            label: `${column.name_en} (${column.name_ar})`,
                          })),
                        ].map((item) => (
                          <option
                            key={item.value || 'empty-column'}
                            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_LABEL.uuid}
                            data-ui-instance-id={`element-column-${item.value || 'empty'}`}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </section>
              )}

              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.ATTRIBUTES_SECTION_LABEL.uuid}
                type="button"
                onClick={() => toggleSection('attributes')}
                className="flex w-full shrink-0 items-center border-b border-outline-variant px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant"
              >
                Attributes{sectionChevron(expanded.attributes)}
              </button>
              {expanded.attributes && (
                <section
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.CONTAINER.uuid}
                  data-ui-instance-id="attributes-panel"
                  className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 border-b border-outline-variant px-3 py-3"
                >
                  <span
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_LABEL.uuid}
                    className="self-center text-xs font-medium"
                  >
                    Attributes
                  </span>
                  <button
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_TOGGLE.uuid}
                    type="button"
                    onClick={() =>
                      setFormState((current) => {
                        const nextEnabled = !current.attributesEnabled;
                        if (nextEnabled) {
                          setExpanded((state) => ({ ...state, attributes: true }));
                        }
                        return { ...current, attributesEnabled: nextEnabled };
                      })
                    }
                    className={`rounded px-2 py-0.5 text-xs ${
                      formState.attributesEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
                    }`}
                  >
                    {formState.attributesEnabled ? 'ON' : 'OFF'}
                  </button>
                  {formState.attributesEnabled && (
                    <>
                      <button
                        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE1_LABEL.uuid}
                        type="button"
                        onClick={() =>
                          setFormState((current) => ({ ...current, attribute1: !current.attribute1 }))
                        }
                        className="col-span-2 flex w-full items-center gap-2 text-start text-xs"
                      >
                        <input
                          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE1_CHECKBOX.uuid}
                          type="checkbox"
                          checked={formState.attribute1}
                          readOnly
                          className="pointer-events-none"
                        />
                        Attribute 1
                      </button>
                      <button
                        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE2_LABEL.uuid}
                        type="button"
                        onClick={() =>
                          setFormState((current) => ({ ...current, attribute2: !current.attribute2 }))
                        }
                        className="col-span-2 flex w-full items-center gap-2 text-start text-xs"
                      >
                        <input
                          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE2_CHECKBOX.uuid}
                          type="checkbox"
                          checked={formState.attribute2}
                          readOnly
                          className="pointer-events-none"
                        />
                        Attribute 2
                      </button>
                      <button
                        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE3_LABEL.uuid}
                        type="button"
                        onClick={() =>
                          setFormState((current) => ({ ...current, attribute3: !current.attribute3 }))
                        }
                        className="col-span-2 flex w-full items-center gap-2 text-start text-xs"
                      >
                        <input
                          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE3_CHECKBOX.uuid}
                          type="checkbox"
                          checked={formState.attribute3}
                          readOnly
                          className="pointer-events-none"
                        />
                        Attribute 3
                      </button>
                    </>
                  )}
                </section>
              )}

              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.SAVE_BUTTON.uuid}
                type="button"
                onClick={() => void handleSave()}
                disabled={saveStatus === 'saving'}
                className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded bg-primary px-2 py-1.5 text-xs text-on-primary disabled:opacity-60"
              >
                {saveLabel}
              </button>
            </>
          )}

          <DatabaseRefEditor
            data={databaseRefDraft}
            onChange={setDatabaseRefDraft}
            onSave={handleSaveDatabaseRef}
            saveStatus={refSaveStatus}
          />

          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SEARCH_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('filters')}
            className="flex w-full shrink-0 items-center border-b border-outline-variant px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant"
          >
            Filters{sectionChevron(expanded.filters)}
          </button>
          {expanded.filters && (
            <>
              <input
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SEARCH_INPUT.uuid}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="UUID, id, path, feature..."
                className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
              />
              <span
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_LABEL.uuid}
                className="mx-3 mb-1 block text-xs text-on-surface-variant"
              >
                Feature
              </span>
              <select
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_SELECT.uuid}
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value)}
                className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
              >
                {featureOptions.map((feature) => (
                  <option
                    key={feature}
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
                    data-ui-instance-id={`feature-${feature}`}
                    value={feature}
                  >
                    {feature}
                  </option>
                ))}
              </select>
              <span
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_LABEL.uuid}
                className="mx-3 mb-1 block text-xs text-on-surface-variant"
              >
                Tag type
              </span>
              <select
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_SELECT.uuid}
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
              >
                {TAG_FILTERS.map((tag) => (
                  <option
                    key={tag}
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                    data-ui-instance-id={`tag-${tag}`}
                    value={tag}
                  >
                    {tag}
                  </option>
                ))}
              </select>
              <span
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_LABEL.uuid}
                className="mx-3 mb-1 block text-xs text-on-surface-variant"
              >
                Lifecycle
              </span>
              <select
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_SELECT.uuid}
                value={lifecycleFilter}
                onChange={(e) => setLifecycleFilter(e.target.value)}
                className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
              >
                {LIFECYCLE_FILTERS.map((item) => (
                  <option
                    key={item.value}
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_OPTION.uuid}
                    data-ui-instance-id={`lifecycle-${item.value}`}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_MISSING_LABEL.uuid}
                type="button"
                onClick={() => setMissingSourceOnly((value) => !value)}
                className={`mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded border px-2 py-1.5 text-start text-sm ${
                  missingSourceOnly ? 'border-primary bg-primary-container' : 'border-outline-variant'
                }`}
              >
                <input
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_MISSING_CHECKBOX.uuid}
                  type="checkbox"
                  checked={missingSourceOnly}
                  readOnly
                  className="pointer-events-none"
                />
                Missing source only
              </button>
            </>
          )}

          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.COUNT.uuid}
            type="button"
            onClick={() => toggleSection('list')}
            className="flex w-full shrink-0 items-center border-b border-outline-variant px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant"
          >
            Elements ({filteredElements.length}/{elements.length}){sectionChevron(expanded.list)}
          </button>
          {expanded.list && (
            <div
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.LIST.uuid}
              className="overflow-x-auto border-b border-outline-variant"
            >
              {filteredElements.map((el) => (
                <button
                  key={el.scanKey}
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.LIST_ITEM.uuid}
                  data-ui-instance-id={el.scanKey}
                  type="button"
                  onClick={() => selectElement(el.scanKey)}
                  className={`block w-full border-b border-outline-variant px-3 py-2 text-start text-xs hover:bg-surface-variant ${
                    selectedScanKey === el.scanKey ? 'bg-primary-container' : ''
                  }`}
                >
                  {el.id || el.uuid.slice(0, 8)} | {el.tagName} | {el.feature}
                </button>
              ))}
            </div>
          )}

          <section
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.CONTAINER.uuid}
            className={`${expanded.details ? 'overflow-x-auto' : ''}`}
          >
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TITLE.uuid}
              type="button"
              onClick={() => toggleSection('details')}
              className="flex w-full shrink-0 items-center px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant"
            >
              Full details{sectionChevron(expanded.details)}
            </button>
            {expanded.details && (
              <>
                {!selected ? (
                  <p
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.EMPTY_MESSAGE.uuid}
                    className="overflow-y-auto px-3 pb-3 text-sm text-on-surface-variant"
                  >
                    Select an element from the preview or list to inspect its registry metadata.
                  </p>
                ) : (
                  <>
                    <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.FEATURE_LABEL.uuid} className="px-3 text-xs font-medium">
                      {t(DEVTOOLS.UI_INSPECTOR.DETAILS.FEATURE_LABEL)}
                    </span>
                    <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.FEATURE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
                      {emptyDisplayValue(selected.feature)}
                    </code>
                    <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.LIFECYCLE_LABEL.uuid} className="px-3 text-xs font-medium">
                      {t(DEVTOOLS.UI_INSPECTOR.DETAILS.LIFECYCLE_LABEL)}
                    </span>
                    <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.LIFECYCLE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
                      {emptyDisplayValue(selected.lifecycle)}
                    </code>
                    <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_FILE_LABEL.uuid} className="px-3 text-xs font-medium">
                      {t(DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_FILE_LABEL)}
                    </span>
                    <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_FILE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
                      {emptyDisplayValue(selected.sourceFile)}
                    </code>
                    <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_COMPONENT_LABEL.uuid} className="px-3 text-xs font-medium">
                      {t(DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_COMPONENT_LABEL)}
                    </span>
                    <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_COMPONENT_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
                      {emptyDisplayValue(selected.sourceComponent)}
                    </code>
                    <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_LINE_LABEL.uuid} className="px-3 text-xs font-medium">
                      {t(DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_LINE_LABEL)}
                    </span>
                    <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_LINE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
                      {selected.sourceLine ? String(selected.sourceLine) : '-'}
                    </code>
                    <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.INSTANCE_LABEL.uuid} className="px-3 text-xs font-medium">
                      {t(DEVTOOLS.UI_INSPECTOR.DETAILS.INSTANCE_LABEL)}
                    </span>
                    <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.INSTANCE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
                      {emptyDisplayValue(selected.instanceId)}
                    </code>
                    <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.IDENTITY_KEY_LABEL.uuid} className="px-3 text-xs font-medium">
                      {t(DEVTOOLS.UI_INSPECTOR.DETAILS.IDENTITY_KEY_LABEL)}
                    </span>
                    <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.IDENTITY_KEY_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
                      {emptyDisplayValue(selected.identityKey)}
                    </code>
                    <button
                      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.COPY_UUID_BUTTON.uuid}
                      type="button"
                      onClick={() => copyText(selected.uuid)}
                      className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
                    >
                      Copy UUID
                    </button>
                    <button
                      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.COPY_PATH_BUTTON.uuid}
                      type="button"
                      onClick={() => copyText(selected.path)}
                      className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
                    >
                      Copy identity path
                    </button>
                    <button
                      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.COPY_SOURCE_BUTTON.uuid}
                      type="button"
                      onClick={() => copyText(sourceLocation)}
                      className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
                    >
                      Copy source location
                    </button>
                    <button
                      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.HIGHLIGHT_BUTTON.uuid}
                      type="button"
                      onClick={() => sendHighlight(selected.scanKey)}
                      className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
                    >
                      Highlight in preview
                    </button>
                    <button
                      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SCROLL_BUTTON.uuid}
                      type="button"
                      onClick={() => sendScroll(selected.scanKey)}
                      className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
                    >
                      Scroll to element
                    </button>
                  </>
                )}
              </>
            )}
          </section>
        </aside>

        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.LAYOUT.RESIZER.uuid}
          type="button"
          aria-label="Resize inspector sidebar"
          onMouseDown={handleResizeStart}
          style={{ width: RESIZER_WIDTH }}
          className="shrink-0 cursor-col-resize border-0 bg-outline-variant/50 hover:bg-primary/50 active:bg-primary/70"
        />

        <section
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.CONTAINER.uuid}
          className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-variant"
        >
          <section
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.CONTROLS.uuid}
            className="flex shrink-0 flex-wrap items-center gap-2 border-b border-outline-variant px-2 py-2"
          >
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.ZOOM_OUT.uuid}
              type="button"
              onClick={() => updatePreviewSize({ scale: previewSize.scale * 0.9 })}
              className="rounded border border-outline-variant px-2 py-1 text-xs"
            >
              -
            </button>
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.ZOOM_VALUE.uuid}
              type="number"
              min={1}
              value={previewZoomPercent}
              onChange={(e) => {
                const percent = Number(e.target.value);
                if (!Number.isFinite(percent) || percent <= 0) return;
                updatePreviewSize({ scale: percent / 100 });
              }}
              className="w-16 rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
            />
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.ZOOM_IN.uuid}
              type="button"
              onClick={() => updatePreviewSize({ scale: previewSize.scale * 1.1 })}
              className="rounded border border-outline-variant px-2 py-1 text-xs"
            >
              +
            </button>
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.WIDTH_INPUT.uuid}
              type="number"
              min={1}
              value={Math.round(previewSize.width)}
              onChange={(e) => {
                const width = Number(e.target.value);
                if (!Number.isFinite(width) || width <= 0) return;
                updatePreviewSize({ width });
              }}
              className="w-20 rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
            />
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.HEIGHT_INPUT.uuid}
              type="number"
              min={1}
              value={Math.round(previewSize.height)}
              onChange={(e) => {
                const height = Number(e.target.value);
                if (!Number.isFinite(height) || height <= 0) return;
                updatePreviewSize({ height });
              }}
              className="w-20 rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
            />
          </section>

          <section
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.SCROLL.uuid}
            className="min-h-0 flex-1 overflow-auto p-2"
          >
            <section
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.FRAME.uuid}
              style={{ width: previewFrameWidth, height: previewFrameHeight }}
              className="inline-block rounded border border-outline-variant bg-surface shadow-sm"
            >
              <iframe
                ref={iframeRef}
                key={iframeKey}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.IFRAME.uuid}
                title="UI Inspector preview"
                src={iframeSrc}
                style={{ width: previewFrameWidth, height: previewFrameHeight }}
                className="block rounded bg-surface"
              />
            </section>
          </section>
        </section>
      </div>
    </div>
  );
}
