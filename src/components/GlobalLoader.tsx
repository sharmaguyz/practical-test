'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';

export default function GlobalLoader() {
  const pathname = usePathname();
  const { setLoading } = useLoading();
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (prevPath !== pathname) {
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 500);
      setPrevPath(pathname);
      return () => clearTimeout(timeout);
    }
  }, [pathname]);
  useEffect(() => {
    const allowedPages = ["/signin", "/checkout", "/course-detail"];
    const currentPath = window.location.pathname;
    if (!allowedPages.some(p => currentPath.startsWith(p))) {
      localStorage.removeItem("via");
      localStorage.removeItem("courseId");
    }
  }, [pathname]);
  return null;
}
