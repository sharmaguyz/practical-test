import './globals.css';
import { Outfit } from 'next/font/google';
import { AppProviders } from './provider';

const outfit = Outfit({
  subsets: ['latin'],
});

export const metadata = {
  title: 'Practical Academy',
  description: 'Practical Academy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-...your-integrity..."
          referrerPolicy="no-referrer"
        />
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet"></link>
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
