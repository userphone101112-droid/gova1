'use client';

import { useState } from 'react';

export function Test2Content() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="mx-auto min-h-48 max-w-5xl space-y-6 bg-background px-4 py-8">
      <h1 className="text-2xl font-bold text-on-surface">
        Test 2 Page
      </h1>
      <p className="text-on-surface-variant">
        This is a simple interactive test page with no translations, registry requirements, or UUID constraints.
      </p>
      
      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container p-4">
        <button
          type="button"
          onClick={() => setClickCount((prev) => prev + 1)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          Click here to interact
        </button>
        
        {clickCount > 0 && (
          <p className="text-sm text-on-surface">
            Click Count: <span className="font-bold text-primary">{clickCount}</span>
          </p>
        )}
      </div>
    </div>
  );
}
