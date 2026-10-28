import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAdminFromCookie } from "@/lib/auth";
import { deriveDerangement, validateDraw } from "@/lib/draw";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  // 1. Verify Admin Cookie
  const admin = await resolveAdminFromCookie();
  if (!admin || admin.roomCode !== params.code.toUpperCase()) {
    return NextResponse.json({ error: "Not authorized as admin" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const { data: room } = await sb
    .from("rooms")
    .select("id, drawn_at, reveal_at")
    .eq("id", admin.roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const revealAt = new Date(room.reveal_at);
  if (room.drawn_at && new Date() >= revealAt) {
    return NextResponse.json(
      { error: "Reveal has already happened. Cannot re-draw." },
      { status: 403 }
    );
  }

  const { data: members } = await sb
    .from("members")
    .select("id")
    .eq("room_id", room.id);

  if (!members || members.length < 2) {
    return NextResponse.json(
      { error: "Need at least 2 members to draw." },
      { status: 400 }
    );
  }

  const ids = members.map((m) => m.id);
  let pairs;
  try {
    pairs = deriveDerangement(ids);
    validateDraw(ids, pairs);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Draw failed" }, { status: 500 });
  }

  await sb.from("assignments").delete().eq("room_id", room.id);
  await sb.from("assignments").insert(pairs.map(p => ({ ...p, room_id: room.id })));
  await sb.from("rooms").update({ drawn_at: new Date().toISOString() }).eq("id", room.id);

  return NextResponse.json({ ok: true, drawnCount: pairs.length });
}