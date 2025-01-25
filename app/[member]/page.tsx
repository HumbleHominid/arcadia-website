export default async function Page({
	params
}:{
	params: Promise<{member: string}>
}) {
	return (
		<h1 className="text-5xl">{(await params).member}</h1>
	)
}