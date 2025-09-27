import FamilyTreeClient from './client';

// Static export support - return empty array for dynamic routes  
export function generateStaticParams() {
  return [];
}

export default function FamilyTreePage() {
  return <FamilyTreeClient />;
}