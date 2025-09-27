// Static export support - return empty array for dynamic routes
export function generateStaticParams() {
  return [];
}

export default function CatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}