'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react';

import type { InspectorRoutePath } from '../../inspector-routes';
import {
  isUiInspectorFrameMessage,
  postToInspectorFrame,
  UI_INSPECTOR_CHANNEL,
  type InspectElementSnapshot,
} from '../../UiInspectorFrameBridge';
import { selectFrameCandidates } from '../data/frame-candidates';
import { formStateFromEntry, getInspectorData, emptyFormState } from '../data/inspector-config-storage';
import {
  buildRelationshipsGraph,
  buildReverseIndex,
} from '../data/inspector-file-layout-utils';
import { loadDatabaseRefFile } from '../services/database-ref.service';
import { loadInspectorConfigMap } from '../services/inspector-config.service';
import { loadStorageRefFile } from '../services/storage-ref.service';
import {
  clampSidebarWidth,
  persistFramesModeEnabled,
  persistPickModeEnabled,
  persistSidebarWidth,
  readFramesModeEnabled,
  readPickModeEnabled,
  readPreviewSize,
  readSidebarWidth,
} from '../utils/layout-storage';

import type { InspectorAction, InspectorState } from './inspector-actions';
import { useInspectorSelectors } from './inspector-selectors';
import { createInitialInspectorState, inspectorReducer } from './inspector-store';

type InspectorContextValue = {
  state: InspectorState;
  dispatch: Dispatch<InspectorAction>;
  selectors: ReturnType<typeof useInspectorSelectors>;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  selectElement: (scanKey: string) => void;
  toggleSection: (section: keyof InspectorState['expanded']) => void;
  handleRouteChange: (route: InspectorRoutePath) => void;
  handleRefresh: () => void;
  handlePickModeToggle: () => void;
  handleFramesModeToggle: () => void;
  handleResizeStart: () => void;
  sendHighlight: (scanKey: string) => void;
  sendScroll: (scanKey: string) => void;
  handleAutofill: () => void;
};

const InspectorContext = createContext<InspectorContextValue | null>(null);

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inspectorReducer, undefined, createInitialInspectorState);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sidebarWidthRef = useRef(state.sidebarWidth);
  const draggingRef = useRef(false);
  const loadedIdentityKeyRef = useRef<string | null>(null);
  const framesModeRef = useRef(state.framesModeEnabled);
  const selectors = useInspectorSelectors(state);

  useEffect(() => {
    framesModeRef.current = state.framesModeEnabled;
  }, [state.framesModeEnabled]);

  useEffect(() => {
    sidebarWidthRef.current = state.sidebarWidth;
  }, [state.sidebarWidth]);

  useEffect(() => {
    const loadLayout = async () => {
      const [sidebarWidth, previewSize, pickModeEnabled, framesModeEnabled] =
        await Promise.all([
          readSidebarWidth(),
          readPreviewSize(),
          readPickModeEnabled(),
          readFramesModeEnabled(),
        ]);
      dispatch({
        type: 'SET_SIDEBAR_WIDTH',
        width: clampSidebarWidth(sidebarWidth, window.innerWidth),
      });
      dispatch({ type: 'SET_PREVIEW_SIZE', previewSize });
      dispatch({ type: 'SET_PICK_MODE', enabled: pickModeEnabled });
      dispatch({ type: 'SET_FRAMES_MODE', enabled: framesModeEnabled });
    };
    void loadLayout();
  }, []);

  const sendBindingFrames = useCallback(
    (enabled: boolean, candidates = selectFrameCandidates(state)) => {
      postToInspectorFrame(
        iframeRef.current,
        enabled
          ? {
              channel: UI_INSPECTOR_CHANNEL,
              type: 'SET_BINDING_FRAMES',
              enabled: true,
              candidates,
            }
          : { channel: UI_INSPECTOR_CHANNEL, type: 'CLEAR_BINDING_FRAMES' },
        window.location.origin
      );
    },
    [state]
  );

  const clearBindingFrames = useCallback(() => {
    postToInspectorFrame(
      iframeRef.current,
      { channel: UI_INSPECTOR_CHANNEL, type: 'CLEAR_BINDING_FRAMES' },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [configMap, refData, storageData] = await Promise.all([
          loadInspectorConfigMap(),
          loadDatabaseRefFile(),
          loadStorageRefFile(),
        ]);
        dispatch({ type: 'SET_ALL_INSPECTOR_DATA', data: configMap });
        dispatch({ type: 'SET_DATABASE_REF', data: refData });
        dispatch({ type: 'SET_DATABASE_REF_DRAFT', data: refData });
        dispatch({ type: 'SET_STORAGE_REF', data: storageData });
      } catch {
        /* ignore load errors in devtools */
      }
    };
    void load();
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

  const sendClearHighlight = useCallback(() => {
    postToInspectorFrame(
      iframeRef.current,
      { channel: UI_INSPECTOR_CHANNEL, type: 'CLEAR_HIGHLIGHT' },
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

  const handleAutofill = useCallback(() => {
    postToInspectorFrame(
      iframeRef.current,
      { channel: UI_INSPECTOR_CHANNEL, type: 'AUTOFILL_REGISTRATION' },
      window.location.origin
    );
  }, []);

  const selectElement = useCallback(
    (scanKey: string) => {
      const element = state.elements.find((el) => el.scanKey === scanKey);
      if (!element) return;
      dispatch({ type: 'SELECT_ELEMENT', scanKey, element });
    },
    [state.elements]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isUiInspectorFrameMessage(event.data)) return;

      if (event.data.type === 'SCAN_RESULT') {
        dispatch({
          type: 'SET_ELEMENTS',
          elements: event.data.elements,
          lastScanTime: new Date(),
        });
        if (framesModeRef.current) {
          window.setTimeout(() => {
            sendBindingFrames(
              true,
              selectFrameCandidates({
                elements: event.data.elements,
                allInspectorData: state.allInspectorData,
                selectedIdentityKey: state.selectedIdentityKey,
                relationshipReverseIndex: state.relationshipReverseIndex,
              })
            );
          }, 0);
        }
      }

      if (event.data.type === 'READY') {
        dispatch({ type: 'SET_IFRAME_READY', ready: true });
        sendPickMode(state.pickModeEnabled);
        requestScan();
        if (framesModeRef.current) {
          sendBindingFrames(true);
        }
      }

      if (event.data.type === 'ELEMENT_PICKED') {
        selectElement(event.data.scanKey);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [
    requestScan,
    selectElement,
    sendBindingFrames,
    sendPickMode,
    state.allInspectorData,
    state.pickModeEnabled,
    state.relationshipReverseIndex,
    state.selectedIdentityKey,
  ]);

  useEffect(() => {
    if (state.selectedScanKey) sendHighlight(state.selectedScanKey);
  }, [state.selectedScanKey, sendHighlight, state.iframeKey]);

  useEffect(() => {
    if (!state.iframeReady) return;
    sendPickMode(state.pickModeEnabled);
  }, [state.pickModeEnabled, sendPickMode, state.iframeReady]);

  useEffect(() => {
    const identityKey = state.selectedIdentityKey;
    const selectedElement = state.lastSelectedElement;

    if (!identityKey || !selectedElement) {
      if (loadedIdentityKeyRef.current !== null) {
        dispatch({ type: 'SET_FORM_STATE', formState: emptyFormState() });
        dispatch({ type: 'SET_DATABASE_PANEL_PINNED', pinned: false });
      }
      loadedIdentityKeyRef.current = null;
      return;
    }

    if (loadedIdentityKeyRef.current === identityKey) {
      return;
    }

    loadedIdentityKeyRef.current = identityKey;
    const saved = getInspectorData(state.allInspectorData, selectedElement);
    dispatch({
      type: 'LOAD_ELEMENT_FORM',
      formState: formStateFromEntry(saved, state.databaseRef),
    });
  }, [state.selectedIdentityKey, state.lastSelectedElement, state.allInspectorData, state.databaseRef]);

  useEffect(() => {
    const graph = buildRelationshipsGraph(state.allInspectorData);
    dispatch({ type: 'SET_RELATIONSHIP_REVERSE_INDEX', reverseIndex: buildReverseIndex(graph) });
  }, [state.allInspectorData]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      dispatch({
        type: 'SET_SIDEBAR_WIDTH',
        width: clampSidebarWidth(event.clientX, window.innerWidth),
      });
    };

    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      persistSidebarWidth(sidebarWidthRef.current);
    };

    const onWindowResize = () => {
      dispatch({
        type: 'SET_SIDEBAR_WIDTH',
        width: clampSidebarWidth(sidebarWidthRef.current, window.innerWidth),
      });
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

  const toggleSection = useCallback((section: keyof InspectorState['expanded']) => {
    dispatch({ type: 'TOGGLE_SECTION', section });
  }, []);

  const handleRouteChange = useCallback((routePath: InspectorRoutePath) => {
    dispatch({ type: 'SET_ROUTE', routePath });
  }, []);

  const handleRefresh = useCallback(() => {
    dispatch({ type: 'REFRESH_IFRAME' });
  }, []);

  useEffect(() => {
    if (!state.iframeReady || !state.framesModeEnabled) return;
    sendBindingFrames(true, selectFrameCandidates(state));
  }, [
    state.elements,
    state.allInspectorData,
    state.selectedIdentityKey,
    state.relationshipReverseIndex,
    state.framesModeEnabled,
    state.iframeReady,
    state.iframeKey,
    state.routePath,
    sendBindingFrames,
  ]);

  const handleFramesModeToggle = useCallback(() => {
    const next = !state.framesModeEnabled;
    dispatch({ type: 'SET_FRAMES_MODE', enabled: next });
    persistFramesModeEnabled(next);
    if (next) {
      sendBindingFrames(true, selectFrameCandidates(state));
    } else {
      clearBindingFrames();
    }
  }, [clearBindingFrames, sendBindingFrames, state]);
  const handlePickModeToggle = useCallback(() => {
    const next = !state.pickModeEnabled;
    dispatch({ type: 'SET_PICK_MODE', enabled: next });
    persistPickModeEnabled(next);
    if (!next) {
      loadedIdentityKeyRef.current = null;
      dispatch({ type: 'CLEAR_SELECTED_ELEMENT' });
      sendClearHighlight();
    }
  }, [sendClearHighlight, state.pickModeEnabled]);

  const handleResizeStart = useCallback(() => {
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const value = useMemo<InspectorContextValue>(
    () => ({
      state,
      dispatch,
      selectors,
      iframeRef,
      selectElement,
      toggleSection,
      handleRouteChange,
      handleRefresh,
      handlePickModeToggle,
      handleFramesModeToggle,
      handleResizeStart,
      sendHighlight,
      sendScroll,
      handleAutofill,
    }),
    [
      state,
      selectors,
      selectElement,
      toggleSection,
      handleRouteChange,
      handleRefresh,
      handlePickModeToggle,
      handleFramesModeToggle,
      handleResizeStart,
      sendHighlight,
      sendScroll,
      handleAutofill,
    ]
  );

  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>;
}

export function useInspectorContext(): InspectorContextValue {
  const context = useContext(InspectorContext);
  if (!context) {
    throw new Error('useInspectorContext must be used within InspectorProvider');
  }
  return context;
}

export type { InspectElementSnapshot };
