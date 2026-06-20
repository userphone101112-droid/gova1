'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { runInitialization } from '@/lib/initialization/initialization';
import { isInspectMode } from '@/platform/ui/devtools/inspector-routes';
import { useUnifiedStore } from '@/store/unified.store';

import ProgressIndicator from './ProgressIndicator';

export default function SplashInitializer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectMode = isInspectMode(`?${searchParams.toString()}`);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const isCompleteRef = useRef(false);

  const isMaintenanceActive = useUnifiedStore((state) => state.isMaintenanceActive);
  const activeMaint = isMaintenanceActive();

  useEffect(() => {
    if (activeMaint) return;

    const initialize = async () => {
      try {
        await runInitialization(({ progress, status }) => {
          setProgress(progress);
          setStatus(status);
        });
        
        isCompleteRef.current = true;
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    initialize();
  }, [activeMaint]);

  // Redirect after 100% is rendered (skip in inspect mode for UI Inspector preview)
  useEffect(() => {
    if (activeMaint || inspectMode) return;
    if (isCompleteRef.current && progress === 100) {
      router.replace('/home');
    }
  }, [progress, router, activeMaint, inspectMode]);

  return <ProgressIndicator progress={progress} status={status} />;
}
