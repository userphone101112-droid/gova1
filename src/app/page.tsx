import SplashScreen from '@/components/splash/SplashScreen';

/** Splash-only route — outside `(app)` so AppShell never wraps `/`. */
export default function SplashRoute() {
  return <SplashScreen />;
}
