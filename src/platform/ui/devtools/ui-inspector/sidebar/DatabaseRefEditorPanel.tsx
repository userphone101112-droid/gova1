'use client';

import { useDatabaseRefEditor } from '../hooks/useDatabaseRefEditor';

import { DatabaseRefEditor } from './DatabaseRefEditor';

export function DatabaseRefEditorPanel() {
  const { draft, saveStatus, setDraft, saveDraft } = useDatabaseRefEditor();

  return (
    <DatabaseRefEditor
      data={draft}
      onChange={setDraft}
      onSave={saveDraft}
      saveStatus={saveStatus}
    />
  );
}
