import { NextResponse } from "next/server";
import { readAdminSession } from "@/src/lib/cookies";

export async function GET() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ artifacts: [] });
}
