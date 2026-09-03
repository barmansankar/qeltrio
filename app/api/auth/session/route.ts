import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/firestore-service";
import {
  createSessionCookie,
  establishUserSession,
  getClearSessionCookieOptions,
  getSessionCookieOptions,
} from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idToken?: string;
      name?: string;
      email?: string;
      isNewUser?: boolean;
    };

    if (!body.idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    const user = await establishUserSession({
      idToken: body.idToken,
      name: body.name,
      email: body.email,
      isNewUser: body.isNewUser,
    });

    if (body.isNewUser) {
      await recordAnalyticsEvent({ type: "signup" });
    }

    const sessionCookie = await createSessionCookie(body.idToken);
    const response = NextResponse.json({ user: user.profile });
    response.cookies.set(getSessionCookieOptions(sessionCookie));

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in. Please try again." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getClearSessionCookieOptions());
  return response;
}
