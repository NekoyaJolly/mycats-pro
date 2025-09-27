import PedigreeClient from './client';

// Static export support - return empty array for dynamic routes  
export function generateStaticParams() {
  return [];
}

export default function PedigreePage() {
  return <PedigreeClient />;
}