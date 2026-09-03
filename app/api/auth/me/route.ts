import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: user.profile });
  } catch {
    return NextResponse.json(
      { error: "Unable to load profile." },
      { status: 500 }
    );
  }
}
