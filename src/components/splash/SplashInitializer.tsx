'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { runInitialization } from '@/lib/initialization/initialization';
import ProgressIndicator from './ProgressIndicator';

export default function SplashInitializer() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const isCompleteRef = useRef(false);

  useEffect(() => {
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
  }, []);

  // Redirect after 100% is rendered
  useEffect(() => {
    if (isCompleteRef.current && progress === 100) {
      router.replace('/home');
    }
  }, [progress, router]);

  return <ProgressIndicator progress={progress} status={status} />;
}
