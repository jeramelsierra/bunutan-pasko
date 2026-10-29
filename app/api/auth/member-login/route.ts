import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPin, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = String(body.code ?? "").toUpperCase().trim();
  const pin = String(body.pin ?? "");

  if (!code || pin.length !== 6) {
    return NextResponse.json({ error: "Code and 6-digit PIN are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // 1. Find the room
  const { data: room } = await sb.from("rooms").select("id").eq("code", code).maybeSingle();
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // 2. Find all members in that room who have a PIN
  const { data: members } = await sb
    .from("members")
    .select("id, access_token, pin_hash")
    .eq("room_id", room.id)
    .not("pin_hash", "is", null);

  if (!members || members.length === 0) {
    return NextResponse.json({ error: "No members with PINs found in this room" }, { status: 404 });
  }

  // 3. Loop through members and check if the PIN matches
  let matchedMember = null;
  for (const member of members) {
    const isValid = await verifyPin(pin, member.pin_hash!);
    if (isValid) {
      matchedMember = member;
      break;
    }
  }

  if (!matchedMember) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  // 4. Set the session cookie
  setSessionCookie(matchedMember.access_token);

  return NextResponse.json({ ok: true });
}