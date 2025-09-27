import PedigreeDetailClient from './client';

// Static export support - return empty array for dynamic routes  
export function generateStaticParams() {
  return [];
}

export default function PedigreeDetailPage() {
  return <PedigreeDetailClient />;
}