import dynamic from 'next/dynamic';

export const dynamicImport = (
  importFn: () =>
    Promise<{ default: React.ComponentType<unknown> }>,
  options?: {
    ssr?: boolean;
    loading?: any;
  }
) => {
  return dynamic(importFn, {
    ssr: options?.ssr ?? false,
    loading: options?.loading,
  });
};

export const lazyLoadComponent = (
  componentPath: string,
  options?: {
    ssr?: boolean;
    loading?: any;
  }
) => {
  return dynamic(() => import(componentPath), {
    ssr: options?.ssr ?? false,
    loading: options?.loading,
  });
};
