'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { runInitialization } from '@/lib/initialization/initialization';
import { useSettingsStore } from '@/store/settings.store';

import ProgressIndicator from './ProgressIndicator';

export default function SplashInitializer() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const isCompleteRef = useRef(false);

  const isMaintenanceActive = useSettingsStore((state) => state.isMaintenanceActive);
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

  // Redirect after 100% is rendered
  useEffect(() => {
    if (activeMaint) return;
    if (isCompleteRef.current && progress === 100) {
      router.replace('/home');
    }
  }, [progress, router, activeMaint]);

  return <ProgressIndicator progress={progress} status={status} />;
}
