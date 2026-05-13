import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { learnerCookieName } from "@/src/lib/cookies";

export async function POST(request: NextRequest) {
  const store = await cookies();
  store.delete(learnerCookieName);

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

export async function GET(request: NextRequest) {
  const store = await cookies();
  store.delete(learnerCookieName);

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
