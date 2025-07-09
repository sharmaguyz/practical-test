'use client';

import { useLoading } from '@/context/LoadingContext';
import AppLoader from '@/components/common/AppLoader';

export default function LoadingOverlay() {
  const { isLoading } = useLoading();
  if (!isLoading) return null;
  return <AppLoader />;
}
