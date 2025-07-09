'use client';
import Image from "next/image";
import { useLoading } from '@/context/LoadingContext';

export default function AppLoader() {
  const { loadingMessage } = useLoading();
  return (
    <div className="practical-academy-loader flex items-center justify-center h-screen w-full bg-white">
      <div className="text-center">
        <Image
          src="/images/loader/Practical-academy-loader.gif"
          alt="Your Company Logo"
          width={150}
          height={10}
          className="mx-auto mb-4 mx-auto"
        />
        <span>{loadingMessage !== '' ? loadingMessage : 'Loading, just a moment…'}</span>
      </div>
    </div>
  );
}