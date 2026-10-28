import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPin, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pin = String(body.pin ?? "");
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be 6 digits" }, { status: 400 });
  }

  // Get the token from the cookie
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  // Find the member by token
  const { data: member } = await sb
    .from("members")
    .select("id, pin_hash")
    .eq("access_token", token)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (!member.pin_hash) {
    return NextResponse.json({ ok: true }); // No PIN set, open access
  }

  const isValid = await verifyPin(pin, member.pin_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  // Set a verification cookie so they don't have to type it every refresh
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bunutan_pin_verified", member.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });

  return res;
}