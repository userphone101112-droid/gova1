# Server Architecture - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [API Routes](#api-routes)
5. [Database Layer](#database-layer)
6. [MAOL Observability System](#maol-observability-system)
7. [UI Inspector System](#ui-inspector-system)
8. [Middleware & Security](#middleware--security)
9. [Error Handling](#error-handling)
10. [Development Server](#development-server)
11. [Configuration](#configuration)
12. [API Client](#api-client)
13. [Best Practices](#best-practices)

---

## Overview

The Gova project server is built on Next.js 16.2.9 with a hybrid architecture combining traditional API routes, JSON storage, and a custom observability system (MAOL). The server handles both frontend rendering and backend API operations in a unified application structure.

### Key Technologies
- **Framework**: Next.js 16.2.9 (App Router)
- **Database**: SQLite with Drizzle ORM
- **HTTP Client**: Axios
- **Observability**: Custom MAOL system
- **Runtime**: Node.js
- **Platform**: Cross-platform (Windows/Linux/macOS)

### Key Features
- **Unified Architecture**: Frontend and backend in single Next.js application
- **Type Safety**: TypeScript throughout the stack
- **Observability**: Built-in error tracking and DOM monitoring
- **Security**: Comprehensive middleware with security headers
- **Development Tools**: Custom server manager with health checks
- **JSON Storage**: Persistent data storage for both MAOL and UI Inspector

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                           │
│              (Browser / Mobile App)                        │
└──────────────────────────┬────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────┐
│                  Next.js Application                      │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Middleware Layer                        ││
│  │  (Security Headers, CSP, CORS)                       ││
│  └──────────────────────────┬───────────────────────────┘│
│                             │                           │
│  ┌──────────────────────────▼───────────────────────────┐│
│  │              API Routes (App Router)                 ││
│  │  ┌────────────────┐  ┌────────────────┐            ││
│  │  │  MAOL System   │  │  UI Inspector  │            ││
│  │  │  (Ingest,      │  │  (Data Storage)│            ││
│  │  │   Session)     │  │                │            ││
│  │  └────────────────┘  └────────────────┘            ││
│  └──────────────────────────┬───────────────────────────┘│
│                             │                           │
│  ┌──────────────────────────▼───────────────────────────┐│
│  │              Storage Layer                           ││
│  │  ┌────────────────┐  ┌────────────────┐            ││
│  │  │  JSON Files    │  │  SQLite DB    │            ││
│  │  │  (MAOL, UI)   │  │  (Settings)   │            ││
│  │  └────────────────┘  └────────────────┘            ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Next.js Application Server

**Location**: Root application with App Router

**Configuration**: `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  metadataBase: new URL('http://localhost:3001'),
};
```

**Features**:
- Image optimization with multiple formats
- Remote image support
- Development CORS configuration
- Custom device and image sizes for responsive optimization
- Metadata base configuration for proper social card images

### 2. Middleware Layer

**Location**: `src/middleware.ts`

**Purpose**: Global request/response processing

**Security Headers**:
- `X-DNS-Prefetch-Control`: DNS prefetch control
- `Strict-Transport-Security`: HSTS with 2-year max-age
- `X-Frame-Options`: Clickjacking protection (SAMEORIGIN)
- `X-Content-Type-Options`: MIME type sniffing protection
- `X-XSS-Protection`: XSS filtering
- `Referrer-Policy`: Referrer information control
- `Content-Security-Policy`: CSP policy for resource loading

**Matcher Pattern**:
```typescript
matcher: [
  '/((?!api|_next/static|_next/image|favicon.ico).*)',
]
```

Excludes: API routes, static assets, and favicon from middleware processing.

### 3. API Routes

**Location**: `src/app/api/`

**Current Endpoints**:
- `/api/maol/ingest` - MAOL event ingestion
- `/api/maol/session/[sessionId]` - MAOL session data retrieval
- `/api/ui-inspector` - UI Inspector data storage and retrieval

**Pattern**: Next.js App Router with file-based routing

### 4. Storage Layer

**Databases & Files**:
1. **settings.db** - Application data (categories, products, etc.)
2. **error-data/maol-data.json** - MAOL errors/warnings data
3. **data/maol-dom-data.json** - MAOL DOM summaries
4. **data/ui-inspector-data.json** - UI Inspector element data

---

## API Routes

### MAOL Ingest Endpoint

**Route**: `POST /api/maol/ingest`

**Purpose**: Receives observability events from the browser client

**File**: `src/app/api/maol/ingest/route.ts`

**Request Body**:
```typescript
interface MaolIngestPayload {
  sessionId: string;
  events?: MaolIngestEvent[];
  dom?: MaolDomSummary;
}
```

**Event Types**:
- **Error Events**: Runtime errors with stack traces
- **Warning Events**: Warnings with severity levels (low, medium, high)
- **DOM Summaries**: Structured DOM tree snapshots

**Validation**:
- Session ID format validation (`maol_<alphanumeric>`)
- Event structure validation
- Payload size limits (message: 1000 chars, stack: 3000 chars)
- Message sanitization to remove console formatting

**Response**: Always returns `{ ok: true }` to never block the client

**Security**:
- **Dev Mode**: Always enabled, no feature flag check
- **Prod Mode**: Feature flag check (`NEXT_PUBLIC_MAOL_ENABLED`)
- Silent failure on malformed requests
- Per-event error isolation
- Duplicate event prevention

### MAOL Session Endpoint

**Route**: `GET /api/maol/session/[sessionId]`

**Purpose**: Returns full observability data for a session

**File**: `src/app/api/maol/session/[sessionId]/route.ts`

**Authentication**:
- **Dev Mode**: No authentication required! Just call the endpoint directly
- **Prod Mode**: Requires `MAOL_SECRET` environment variable
  - Bearer token authentication: `Authorization: Bearer <token>`
  - Alternative header: `x-maol-token: <token>`

**Response**:
```typescript
interface MaolAgentResponse {
  sessionId: string;
  errors: MaolErrorEvent[];
  warnings: MaolWarningEvent[];
  dom: MaolDomSummary[];
  summary: MaolSessionSummary;
}
```

**Session Summary**:
```typescript
interface MaolSessionSummary {
  totalErrors: number;
  totalWarnings: number;
  totalWarningsByseverity: Record<MaolWarningSeverity, number>;
  routesVisited: string[];
  sessionStart?: string;
  lastActivity?: string;
}
```

**Security Headers**:
- `Cache-Control: no-store, no-cache`
- `X-Maol-Session: <sessionId>`

### UI Inspector Endpoint

**Route**: `GET /api/ui-inspector` & `POST /api/ui-inspector`

**Purpose**: Storage and retrieval of UI Inspector element data

**File**: `src/app/api/ui-inspector/route.ts`

**GET Request**:
```typescript
// Returns all stored UI Inspector data
Response: { [uiId: string]: InspectorData }
```

**POST Request**:
```typescript
Request Body: {
  uiId: string;
  databaseEnabled: boolean;
  inf1: string;
  inf2: string;
  inf3: string;
  attributesEnabled: boolean;
  attribute1: boolean;
  attribute2: boolean;
  attribute3: boolean;
}

Response: { ok: true }
```

---

## Storage Layer

### Application Database (settings.db)

**Schema**: `src/lib/db/schema.ts`

**Tables**:

#### Categories
```typescript
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  icon: text('icon').notNull(),
  image: text('image').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});
```

#### Subcategories
```typescript
export const subcategories = sqliteTable('subcategories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => categories.id),
  originalId: integer('original_id').notNull(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  icon: text('icon').notNull(),
  image: text('image').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});
```

#### Pharmacy Categories & Subcategories
- Separate tables for pharmacy-specific categorization
- Similar structure to main categories
- Additional fields for pharmacy data files

#### Forms & Strengths
- Reference data for pharmaceutical products
- Junction tables for many-to-many relationships

#### Active Ingredients
```typescript
export const activeIngredients = sqliteTable('active_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pharmacySubcategoryId: integer('pharmacy_subcategory_id')
    .references(() => pharmacySubcategories.id),
  originalId: integer('original_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  isPrescriptionRequired: integer('is_prescription_required', { mode: 'boolean' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});
```

#### Product Brands
```typescript
export const productBrands = sqliteTable('product_brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  activeIngredientId: integer('active_ingredient_id')
    .references(() => activeIngredients.id),
  productId: integer('product_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});
```

**Timestamps Helper**:
```typescript
const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(strftime('%s', 'now') * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(strftime('%s', 'now') * 1000)`),
};
```

### MAOL JSON Storage

**Files**:
- `error-data/maol-data.json` - Errors and warnings
- `data/maol-dom-data.json` - DOM summaries

**Schema**:
```typescript
// error-data/maol-data.json
{
  [sessionId: string]: {
    errors: MaolErrorEvent[],
    warnings: MaolWarningEvent[]
  }
}

// data/maol-dom-data.json
{
  [sessionId: string]: MaolDomSummary[]
}
```

**Features**:
- **Auto-Create**: Directories and files created automatically if missing
- **Deduplication**: Same errors/warnings aren't stored multiple times
- **Sanitization**: Messages cleaned of console formatting characters
- **FIFO Eviction**: Maximum 200 records per session to avoid bloat

**Storage Manager**: `src/lib/maol-store.ts`

---

## MAOL Observability System

### Overview

MAOL (Minimal Agent Observability Layer) is a custom observability system designed for AI agent integration and debugging. It captures errors, warnings, and DOM summaries from the browser and makes them available via API endpoints.

**Key Features (Dev Mode)**:
- **Always Enabled**: No configuration needed!
- **Auto-Save Every 3 Seconds**: DOM summaries automatically sent to server
- **No Authentication Needed**: Session data retrievable without secrets
- **UI Inspector Integration**: Toggle MAOL directly from UI Inspector

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Client                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MAOL Collector                            │  │
│  │  - Captures errors & warnings                         │  │
│  │  - Generates DOM summaries every 3 seconds           │  │
│  │  - Manages session ID (cookie)                        │  │
│  └──────────────────────────┬───────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              │ POST /api/maol/ingest
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                  Server API Route                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Ingest Endpoint                          │  │
│  │  - Validates session ID                              │  │
│  │  - Deduplicates events                               │  │
│  │  - Stores in JSON files                              │  │
│  └──────────────────────────┬───────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                  MAOL Store (JSON Files)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Persistent Storage                        │  │
│  │  - error-data/maol-data.json                         │  │
│  │  - data/maol-dom-data.json                           │  │
│  │  - FIFO eviction (200 records/session)               │  │
│  └──────────────────────────┬───────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              │ GET /api/maol/session/[id]
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                  AI Agent / Inspector                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Session Query                             │  │
│  │  - No secrets needed in dev!                         │  │
│  │  - Returns structured response                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Session Management

**File**: `src/shared/maol/session.ts`

**Session ID Format**: `maol_<10-char nanoid>`

**Cookie Configuration**:
- Name: `maol_session`
- TTL: 24 hours
- SameSite: Strict
- Path: /

**Generation**:
```typescript
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'maol_';
  const array = new Uint8Array(10);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return result;
}
```

**Validation**:
```typescript
export function isValidMaolSessionId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('maol_') && id.length >= 11;
}
```

### Event Types

#### Error Events
```typescript
interface MaolErrorEvent {
  type: 'error';
  message: string;
  stack?: string;
  route: string;
  timestamp: number;
  uiContext?: string;  // UI Identity ID if available
  env: 'dev' | 'prod';
}
```

#### Warning Events
```typescript
interface MaolWarningEvent {
  type: 'warning';
  message: string;
  route: string;
  component?: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  env: 'dev' | 'prod';
}
```

#### DOM Summaries
```typescript
interface MaolDomSummary {
  route: string;
  timestamp: number;
  totalIdentified: number;
  tree: MaolDomTree;
}

interface MaolDomTree {
  type: 'page';
  children: MaolComponentNode[];
}

interface MaolComponentNode {
  name: string;
  uiIds: string[];
  tags: string[];
}
```

### Store Operations

**File**: `src/lib/maol-store.ts`

**Write Operations**:
```typescript
export function storeError(sessionId: string, event: MaolErrorEvent): void
export function storeWarning(sessionId: string, event: MaolWarningEvent): void
export function storeDomSummary(sessionId: string, summary: MaolDomSummary): void
```

**Read Operations**:
```typescript
export function getSessionData(sessionId: string): MaolAgentResponse | null
```

**Cleanup**:
```typescript
export function purgeSession(sessionId: string): void
```

**Features**:
- Automatic FIFO eviction (200 records max per session)
- JSON sanitization before storage (removes console formatting)
- Session ID validation
- Auto-creation of directories and files

### Configuration

**Environment Variables**:
```bash
# Enable MAOL system (only needed for production)
NEXT_PUBLIC_MAOL_ENABLED=false

# Secret token for agent queries (only needed for production)
MAOL_SECRET=replace-with-a-strong-secret-key
```

**Security**:
- Dev Mode: Always enabled, no secrets needed
- Prod Mode: Disabled by default for safety, requires secret token

---

## UI Inspector System

### Overview

The UI Inspector is a developer tool that provides visual inspection and data annotation of UI components. It's **always visible** in development mode and works across all screen sizes.

**Key Features**:
- **Visual Framing**: Colored borders around components with `data-ui-id`
- **Annotation Tools**: Database info and attributes toggles per component
- **MAOL Toggle**: Turn MAOL observability on/off directly from the inspector
- **Persistent Storage**: Data saved to `data/ui-inspector-data.json`
- **Keyboard Shortcut**: Ctrl+Shift+U to toggle overlay (default: visible)

### Architecture

**File**: `src/components/dev/DevUiOverlay.tsx`

**State Management**:
- Zustand store (`src/store/index.ts`) for MAOL toggle
- Local component state for inspector data
- Persistent storage via API endpoint

### Using the UI Inspector

1. **Activate**: Always visible by default. Press `Ctrl+Shift+U` to toggle
2. **Select**: Click on any framed component to open the details panel
3. **Add Data**: Toggle "Database" and enter `inf1/inf2/inf3` values
4. **Set Attributes**: Toggle "Attributes" and check Attribute 1/2/3
5. **Save**: Click "Save Data" button to persist changes
6. **Toggle MAOL**: Use the "MAOL ON/OFF" button in the control bar

### Data Structure

**File**: `data/ui-inspector-data.json`
```json
{
  "[uiId]": {
    "databaseEnabled": false,
    "inf1": "",
    "inf2": "",
    "inf3": "",
    "attributesEnabled": false,
    "attribute1": false,
    "attribute2": false,
    "attribute3": false,
    "dataUiPath": "component-path",
    "dataUiFeature": "feature-name"
  }
}
```

### Frame Colors

- **Blue**: Valid, active UI identity
- **Amber**: Deprecated UI identity
- **Red**: Unregistered or invalid UI identity

---

## Middleware & Security

### Middleware Configuration

**File**: `src/middleware.ts`

### Security Headers

#### HTTP Strict Transport Security (HSTS)
```typescript
response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
```
- 2-year max-age
- Includes subdomains
- Preload for HSTS preload list

#### Frame Options
```typescript
response.headers.set('X-Frame-Options', 'SAMEORIGIN');
```
- Prevents clickjacking
- Only allows framing from same origin

#### Content Type Options
```typescript
response.headers.set('X-Content-Type-Options', 'nosniff');
```
- Prevents MIME type sniffing
- Forces browser to respect declared content type

#### XSS Protection
```typescript
response.headers.set('X-XSS-Protection', '1; mode=block');
```
- Enables XSS filtering
- Blocks suspicious responses

#### Referrer Policy
```typescript
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
```
- Controls referrer information
- Only sends origin on cross-origin requests

#### Content Security Policy
```typescript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self';"
);
```

**CSP Directives**:
- `default-src 'self'`: Only allow resources from same origin
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'`: Scripts from same origin, allow eval and inline
- `style-src 'self' 'unsafe-inline'`: Styles from same origin, allow inline
- `img-src 'self' data: https:`: Images from same origin, data URLs, and HTTPS
- `font-src 'self' data:`: Fonts from same origin and data URLs
- `connect-src 'self' https:`: Connect to same origin and HTTPS
- `frame-src 'self'`: Only allow frames from same origin

### Matcher Configuration

```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Excluded Paths**:
- `/api/*` - API routes
- `/_next/static/*` - Static assets
- `/_next/image/*` - Image optimization
- `/favicon.ico` - Favicon

### Security Best Practices

1. **Defense in Depth**: Multiple layers of security headers
2. **CSP**: Restrict resource loading sources
3. **HSTS**: Enforce HTTPS in production
4. **Frame Protection**: Prevent clickjacking attacks
5. **XSS Protection**: Enable browser XSS filtering
6. **Referrer Control**: Limit information leakage

---

## Error Handling

### Error Types

**File**: `src/types/errors.ts`

#### Error Codes
```typescript
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // API errors
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Client errors
  BAD_REQUEST = 'BAD_REQUEST',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Application errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

#### Error Classes

##### BaseError
```typescript
export class BaseError extends Error implements AppError {
  code: ErrorCode;
  details?: unknown;
  timestamp: Date;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }
}
```

##### NetworkError
```typescript
export class NetworkError extends BaseError {
  constructor(message: string = 'Network error occurred', details?: unknown) {
    super(ErrorCode.NETWORK_ERROR, message, details);
  }
}
```

##### ApiError
```typescript
export class ApiError extends BaseError {
  statusCode: number | undefined;
  endpoint: string | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number | undefined,
    endpoint: string | undefined,
    details?: unknown
  ) {
    super(code, message, details);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}
```

##### ValidationError
```typescript
export class ValidationError extends BaseError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
  }
}
```

### Error Handler

**File**: `src/lib/error-handler.ts`

#### Singleton Pattern
```typescript
export class ErrorHandler {
  private static instance: ErrorHandler;

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
}
```

#### Error Handling Methods

##### handleError
```typescript
public handleError(error: unknown, context?: string): AppError {
  console.error(`[Error Handler] ${context || 'Unknown context'}:`, error);

  if (error instanceof BaseError) {
    return error;
  }

  if (error instanceof Error) {
    return new BaseError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      { originalError: error.name, stack: error.stack }
    );
  }

  if (typeof error === 'string') {
    return new BaseError(ErrorCode.UNKNOWN_ERROR, error);
  }

  return new BaseError(
    ErrorCode.UNKNOWN_ERROR,
    'An unknown error occurred',
    { error }
  );
}
```

##### handleApiError
```typescript
public handleApiError(
  error: unknown,
  endpoint?: string,
  statusCode?: number
): ApiError {
  const appError = this.handleError(error, `API call to ${endpoint}`);

  if (appError instanceof ApiError) {
    return appError;
  }

  return new ApiError(
    this.getErrorCodeFromStatus(statusCode),
    appError.message,
    statusCode,
    endpoint,
    appError.details
  );
}
```

##### Status Code Mapping
```typescript
private getErrorCodeFromStatus(status?: number): ErrorCode {
  if (!status) return ErrorCode.API_ERROR;

  switch (status) {
    case 400: return ErrorCode.BAD_REQUEST;
    case 401: return ErrorCode.UNAUTHORIZED;
    case 403: return ErrorCode.FORBIDDEN;
    case 404: return ErrorCode.NOT_FOUND;
    case 409: return ErrorCode.CONFLICT;
    case 422: return ErrorCode.VALIDATION_ERROR;
    case 500: return ErrorCode.INTERNAL_SERVER_ERROR;
    case 503: return ErrorCode.SERVICE_UNAVAILABLE;
    default: return ErrorCode.API_ERROR;
  }
}
```

### API Error Normalizer

**File**: `src/lib/api-error-normalizer.ts`

#### normalizeApiError
```typescript
export function normalizeApiError(error: unknown, endpoint?: string): ApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    return new ApiError(
      errorHandler['getErrorCodeFromStatus'](statusCode),
      responseData?.message || error.message || 'API request failed',
      statusCode,
      endpoint,
      {
        url: error.config?.url,
        method: error.config?.method,
        response: responseData,
      }
    );
  }

  return errorHandler.handleApiError(error, endpoint);
}
```

#### Error Detection Helpers
```typescript
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && !!error.request;
  }
  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  }
  return false;
}
```

### Error Logging

#### Development Mode
- Full error details logged
- Stack traces included
- Context information preserved

#### Production Mode
- Minimal error logging
- Only essential information
- No sensitive data exposure

---

## Development Server

### Server Manager

**File**: `scripts/dev-server.ts`

### Overview

Custom development server manager with PID tracking, health checks, and lifecycle management. Designed for Windows compatibility with cross-platform support.

### Features

- **Detached Process**: Server runs in background
- **PID Tracking**: Process ID file for management
- **Health Checks**: Automatic server readiness detection
- **Log Management**: Centralized logging to file
- **Cache Management**: Built-in cache clearing
- **Cross-Platform**: Windows/Linux/macOS support

### Configuration

```typescript
const ROOT_DIR = process.cwd();
const PID_FILE = path.join(ROOT_DIR, '.server.pid');
const LOG_FILE = path.join(ROOT_DIR, 'logs', 'dev-server.log');
const NEXT_PORT = parseInt(process.env.PORT ?? '3001', 10);
const NEXT_HOST = process.env.HOSTNAME ?? 'localhost';
const HEALTH_CHECK_TIMEOUT_MS = 30_000;
const HEALTH_CHECK_INTERVAL_MS = 1_000;
```

### Commands

#### start
```bash
npm run server:start
```
- Spawns detached Next.js dev server
- Saves PID to file
- Performs health check
- Logs to `logs/dev-server.log`

#### stop
```bash
npm run server:stop
```
- Reads PID from file
- Gracefully terminates process
- Windows: Uses `taskkill` with process tree
- Unix: Uses process group kill
- Cleans up PID file

#### restart
```bash
npm run server:restart
```
- Stops running server
- Waits 1.5 seconds
- Starts fresh server

#### status
```bash
npm run server:status
```
- Checks if server is running
- Displays PID and URL
- Shows log file location

#### logs
```bash
npm run server:logs
```
- Displays last 50 lines of log
- Shows recent server activity
- Useful for debugging

#### clear-cache
```bash
npm run server:clear-cache
```
- Stops server if running
- Deletes `.next` directory
- Deletes `.swc` directory
- Deletes `tsconfig.tsbuildinfo`
- Waits for cleanup completion

### Health Check

```typescript
function waitForServer(): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= HEALTH_CHECK_TIMEOUT_MS) {
        logError(`Server did not become ready within ${HEALTH_CHECK_TIMEOUT_MS / 1000}s`);
        resolve(false);
        return;
      }

      const req = http.request(
        { host: NEXT_HOST, port: NEXT_PORT, path: '/', method: 'GET', timeout: 2000 },
        (res) => {
          if (res.statusCode !== undefined && res.statusCode < 500) {
            log(`Server is ready at http://${NEXT_HOST}:${NEXT_PORT} (${elapsed}ms)`);
            resolve(true);
          } else {
            setTimeout(check, HEALTH_CHECK_INTERVAL_MS);
          }
        }
      );

      req.on('error', () => setTimeout(check, HEALTH_CHECK_INTERVAL_MS));
      req.on('timeout', () => {
        req.destroy();
        setTimeout(check, HEALTH_CHECK_INTERVAL_MS);
      });
      req.end();
    };

    check();
  });
}
```

**Features**:
- 30-second timeout
- 1-second check interval
- HTTP request to root path
- 2-second request timeout
- Success on any non-5xx status

### PID Management

#### getServerPid
```typescript
function getServerPid(): number | null {
  if (!fs.existsSync(PID_FILE)) return null;

  try {
    const raw = fs.readFileSync(PID_FILE, 'utf-8').trim();
    const pid = parseInt(raw, 10);
    if (isNaN(pid)) {
      fs.unlinkSync(PID_FILE);
      return null;
    }

    // Verify the process is actually running
    process.kill(pid, 0);
    return pid;
  } catch {
    // Process is not running — clean up stale PID file
    try { fs.unlinkSync(PID_FILE); } catch { /* ignore */ }
    return null;
  }
}
```

**Features**:
- Reads PID from file
- Validates PID is numeric
- Checks if process is running
- Cleans up stale PID files

### Windows-Specific Handling

#### Process Tree Kill
```typescript
if (process.platform === 'win32') {
  execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'pipe' });
} else {
  process.kill(-pid, 'SIGTERM');
}
```

**Why Process Tree Kill?**
- Next.js spawns worker processes
- Killing only parent leaves orphans
- `/T` flag kills entire process tree
- `/F` flag forces termination

### Logging

#### Log Format
```
[2024-06-15T12:34:56.789Z] Message
```

#### Log Locations
- Console: Real-time output
- File: `logs/dev-server.log` (persistent)

#### Log Rotation
- Currently no automatic rotation
- Manual management required
- Consider logrotate for production

### Package.json Scripts

```json
{
  "server": "tsx scripts/dev-server.ts",
  "server:start": "tsx scripts/dev-server.ts start",
  "server:stop": "tsx scripts/dev-server.ts stop",
  "server:restart": "tsx scripts/dev-server.ts restart",
  "server:status": "tsx scripts/dev-server.ts status",
  "server:logs": "tsx scripts/dev-server.ts logs",
  "server:clear-cache": "tsx scripts/dev-server.ts clear-cache"
}
```

### Best Practices

1. **Always use server manager** - Don't run `next dev` directly
2. **Check status before starting** - Avoid duplicate servers
3. **Use clear-cache for issues** - Fixes many build problems
4. **Monitor logs** - Check `logs/dev-server.log` for errors
5. **Graceful shutdown** - Use `server:stop` instead of killing process

---

## Configuration

### Environment Variables

**File**: `.env.example` & `.env.local`

### Application Configuration

```bash
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Firebase Configuration

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Environment

```bash
NODE_ENV=development
```

### MAOL Configuration

```bash
# Enable MAOL (only needed for production; always ON in dev)
NEXT_PUBLIC_MAOL_ENABLED=false

# Secret token for agent queries (only needed for production)
MAOL_SECRET=replace-with-a-strong-secret-key
```

### Next.js Configuration

**File**: `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  metadataBase: new URL('http://localhost:3001'),
};
```

### Drizzle Configuration

**File**: `drizzle.config.ts`

```typescript
export default {
  schema: './src/lib/db/schema.ts',
  out: './database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './database/settings.db',
  },
} satisfies Config;
```

### TypeScript Configuration

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Path Aliases

```typescript
"@/*": ["./src/*"]
```

**Usage**:
```typescript
import { HOME } from '@/shared/ui-registry';
import { apiClient } from '@/lib/api-client';
```

---

## API Client

### Overview

**File**: `src/lib/api-client.ts`

Axios-based HTTP client with interceptors for authentication and error handling.

### Configuration

```typescript
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }
}
```

**Default Settings**:
- Base URL: `NEXT_PUBLIC_API_URL` or `/api`
- Timeout: 30 seconds
- Content-Type: `application/json`

### Request Interceptor

```typescript
this.client.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Features**:
- Automatic token injection
- Reads from localStorage
- Bearer token format

### Response Interceptor

```typescript
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error, error.config?.url);
    return Promise.reject(normalizedError);
  }
);
```

**Features**:
- Error normalization
- Context preservation
- Consistent error format

### HTTP Methods

#### GET
```typescript
public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await this.client.get<T>(url, config);
  return response.data;
}
```

#### POST
```typescript
public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await this.client.post<T>(url, data, config);
  return response.data;
}
```

#### PUT
```typescript
public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await this.client.put<T>(url, data, config);
  return response.data;
}
```

#### PATCH
```typescript
public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await this.client.patch<T>(url, data, config);
  return response.data;
}
```

#### DELETE
```typescript
public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await this.client.delete<T>(url, config);
  return response.data;
}
```

### Authentication

#### Token Retrieval
```typescript
private getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}
```

**Features**:
- Browser-only execution
- localStorage integration
- Server-safe (returns null on server)

### Usage Example

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const data = await apiClient.get<User>('/api/user/profile');

// POST request
const result = await apiClient.post<LoginResponse>('/api/auth/login', {
  email: 'user@example.com',
  password: 'password',
});

// Error handling
try {
  const data = await apiClient.get('/api/data');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
  }
}
```

### Singleton Instance

```typescript
export const apiClient = new ApiClient();
```

**Benefits**:
- Single instance across application
- Shared configuration
- Consistent behavior

---

## Best Practices

### API Development

1. **Use TypeScript types** for all request/response data
2. **Implement proper error handling** with try-catch blocks
3. **Validate input data** before processing
4. **Use appropriate HTTP methods** (GET, POST, PUT, DELETE)
5. **Return consistent response formats**
6. **Implement rate limiting** for public endpoints
7. **Add request logging** for debugging
8. **Use environment variables** for configuration

### Database Operations

1. **Use parameterized queries** to prevent SQL injection
