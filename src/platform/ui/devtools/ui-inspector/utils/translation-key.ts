export interface TranslationKeyInput {
  route: string;
  sourceFile: string;
  sourceLine: number;
  sourceColumn: number;
  tagName: string;
  domPath: string;
  textSnippet: string;
}

/**
 * Generate a consistent, unique key for a translation item.
 * Shared between client UI and server API routes.
 */
export function generateTranslationItemKey(input: TranslationKeyInput): string {
  return [
    input.route,
    input.sourceFile.replace(/\\/g, '/'),
    input.sourceLine,
    input.sourceColumn,
    input.tagName,
    input.domPath,
    input.textSnippet.trim(),
  ].join('|');
}
