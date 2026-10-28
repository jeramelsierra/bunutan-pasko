import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPin, setAdminCookie } from "@/lib/auth";

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

  if (!code || !pin) {
    return NextResponse.json({ error: "Code and PIN are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data: room } = await sb
    .from("rooms")
    .select("id, code, admin_pin_hash, admin_token")
    .eq("code", code)
    .maybeSingle();

  if (!room || !room.admin_pin_hash) {
    return NextResponse.json({ error: "Room not found or no admin PIN set" }, { status: 404 });
  }

  const isValid = await verifyPin(pin, room.admin_pin_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Incorrect Admin PIN" }, { status: 401 });
  }

  // Set the admin cookie
  setAdminCookie(room.admin_token);

  return NextResponse.json({ ok: true });
}