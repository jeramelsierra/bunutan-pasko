import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateAccessToken, hashPin, setSessionCookie } from "@/lib/auth";
import { validateJoinRoom } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateJoinRoom({ ...body, code });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { name, pin } = parsed.value;

  const sb = supabaseAdmin();

  const { data: room, error: roomErr } = await sb
    .from("rooms")
    .select("id, drawn_at")
    .eq("code", code)
    .maybeSingle();

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  
  if (room.drawn_at) {
    return NextResponse.json(
      { error: "This room has already been drawn." },
      { status: 403 }
    );
  }

  const accessToken = generateAccessToken(32);
  const pinHash = pin ? await hashPin(pin) : null;

  const { data: member, error } = await sb
    .from("members")
    .insert({
      room_id: room.id,
      name,
      access_token: accessToken,
      pin_hash: pinHash,
      is_admin: false,
    })
    .select("id, name")
    .single();

  if (error || !member) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "That name is already taken in this room." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Could not join room. " + error?.message },
      { status: 500 }
    );
  }

  setSessionCookie(accessToken);

  return NextResponse.json({
    ok: true,
    member: { id: member.id, name: member.name },
    accessToken,
  });
}