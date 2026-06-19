import { ReactNode } from 'react';

interface SignupLayoutProps {
  children: ReactNode;
}

export default function SignupLayout({ children }: SignupLayoutProps) {
  return <>{children}</>;
}
