import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | WookieFoot Fan Site',
  description: 'Search through WookieFoot lyrics, songs, and albums',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
