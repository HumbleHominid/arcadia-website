export default function PageLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<article className="flex md:flex-row flex-col gap-4 w-full px-2">
			{children}
		</article>
	);
}