import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Not Found"
}

export default function NotFound() {
	return (
		<div className="h-96 flex flex-col items-center justify-center relative w-full ">
			<h1 className="m-auto font-bold text-6xl text-white absolute">404 Resource Not Found</h1>
			<h1 className="m-auto -z-10 font-bold text-6xl text-slate-900 absolute translate-x-1 translate-y-1">404 Resource Not Found</h1>
		</div>
	)
}