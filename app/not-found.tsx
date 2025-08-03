import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <div className="relative flex h-96 w-full flex-col items-center justify-center">
      <h1 className="absolute m-auto text-6xl font-bold text-white">
        404 Resource Not Found
      </h1>
      <h1 className="absolute -z-10 m-auto translate-x-1 translate-y-1 text-6xl font-bold text-slate-900">
        404 Resource Not Found
      </h1>
    </div>
  );
}
