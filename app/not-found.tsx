import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <div className="flex h-96 w-full flex-col items-center justify-center">
      <h1 className="text-center text-4xl font-bold text-white text-shadow-[4px_4px_0_var(--color-slate-900)] md:text-6xl">
        404 Resource Not Found
      </h1>
    </div>
  );
}
