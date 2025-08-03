export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <article className="flex w-full flex-col gap-4 px-2 md:flex-row">
      {children}
    </article>
  );
}
