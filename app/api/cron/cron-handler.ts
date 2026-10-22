import { NextRequest, NextResponse } from "next/server";

export function cronHandler(name: string, fn: () => Promise<void>) {
  return async (req: NextRequest) => {
    if (
      process.env.NODE_ENV === "production" &&
      req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      await fn();
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error(`${name} cron failure:`, e);
      return NextResponse.json(
        { error: `${name} cron failed` },
        { status: 500 },
      );
    }
  };
}
