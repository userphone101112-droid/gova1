/**
 * UI Telemetry & Visual Inspector Foundation
 * 
 * This module provides the telemetry extraction layer for analytics and 
 * reverse lookup capabilities for inspector tools and developer diagnostics.
 */

import { getUiIdentityById, getUiIdentity, type UiIdentity, type UiParam } from './ui-registry';
import { UI_SOURCE_INDEX } from './ui-source-index';

export interface UiTelemetryData {
  id: string;
  path: string;
  feature: string;
  timestamp: string;
}

export interface UiErrorTelemetryData extends UiTelemetryData {
  errorMessage: string;
  errorStack?: string | undefined;
}

export interface InspectorLocationInfo extends UiIdentity {
  sourceFile: string;
  sourceComponent: string;
  sourceLine: number;
}

/**
 * Helper to resolve UI Identity from either an HTMLElement or a UiParam.
 */
export function resolveTelemetryIdentity(target: HTMLElement | UiParam | null): UiIdentity | null {
  if (!target) return null;
  if (typeof target === 'object' && 'getAttribute' in target && typeof target.getAttribute === 'function') {
    const id = target.getAttribute('data-ui-id');
    if (!id) return null;
    return getUiIdentityById(id) || null;
  }
  return getUiIdentity(target as UiParam) || null;
}

/**
 * Resolve UI Identity metadata and source file location from a DOM element or UI identity object.
 * Essential for the Visual Inspector, error logs, and AI Agent navigation.
 * 
 * @param target The DOM element or UiParam
 * @returns Metadata including source file and component name, or null if not registered
 */
export function resolveElementIdentity(target: HTMLElement | UiParam | null): InspectorLocationInfo | null {
  const identity = resolveTelemetryIdentity(target);
  if (!identity) return null;

  // Get source code mapping
  const sourceLocation = UI_SOURCE_INDEX[identity.id];

  return {
    ...identity,
    sourceFile: sourceLocation?.sourceFile || 'unknown',
    sourceComponent: sourceLocation?.sourceComponent || 'unknown',
    sourceLine: sourceLocation?.sourceLine || 1,
  };
}

/**
 * Track an interaction event.
 * Extracts the stable UI ID, path, and feature automatically.
 * 
 * @param target The DOM element or UiParam
 * @returns Telemetry data payload, or null if the element has no UI Identity
 */
export function trackUiInteraction(target: HTMLElement | UiParam | null): UiTelemetryData | null {
  const identity = resolveTelemetryIdentity(target);
  if (!identity) return null;

  const telemetryData: UiTelemetryData = {
    id: identity.id,
    path: identity.path,
    feature: identity.feature,
    timestamp: new Date().toISOString(),
  };

  // Log telemetry in development mode
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`[UI Telemetry] Interaction on "${identity.id}"`);
    console.log(`- Path: ${identity.path}`);
    console.log(`- Feature: ${identity.feature}`);
    if (target && typeof target === 'object' && 'getAttribute' in target) {
      console.log(`- Element:`, target);
    }
    const sourceInfo = resolveElementIdentity(target);
    if (sourceInfo) {
      console.log(`- Source: ${sourceInfo.sourceComponent} (${sourceInfo.sourceFile}:${sourceInfo.sourceLine})`);
    }
    console.groupEnd();
  }

  return telemetryData;
}

/**
 * Track a view / exposure event.
 * 
 * @param target The DOM element or UiParam
 * @returns Telemetry data payload, or null if the element has no UI Identity
 */
export function trackUiView(target: HTMLElement | UiParam | null): UiTelemetryData | null {
  const identity = resolveTelemetryIdentity(target);
  if (!identity) return null;

  const telemetryData: UiTelemetryData = {
    id: identity.id,
    path: identity.path,
    feature: identity.feature,
    timestamp: new Date().toISOString(),
  };

  // Log telemetry in development mode
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`[UI Telemetry] View on "${identity.id}"`);
    console.log(`- Path: ${identity.path}`);
    console.log(`- Feature: ${identity.feature}`);
    console.groupEnd();
  }

  return telemetryData;
}

/**
 * Track an error event occurring on a UI identity.
 * 
 * @param target The DOM element or UiParam
 * @param error The thrown error object
 * @returns Error telemetry payload, or null if target has no UI identity
 */
export function trackUiError(target: HTMLElement | UiParam | null, error: Error): UiErrorTelemetryData | null {
  const identity = resolveTelemetryIdentity(target);
  if (!identity) return null;

  const telemetryData: UiErrorTelemetryData = {
    id: identity.id,
    path: identity.path,
    feature: identity.feature,
    timestamp: new Date().toISOString(),
    errorMessage: error.message,
    errorStack: error.stack,
  };

  // Log telemetry in development mode
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`[UI Telemetry] ERROR on "${identity.id}"`);
    console.log(`- Path: ${identity.path}`);
    console.log(`- Feature: ${identity.feature}`);
    console.error(`- Error: ${error.message}`, error);
    console.groupEnd();
  }

  return telemetryData;
}
