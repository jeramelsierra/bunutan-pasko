// API route, not a Server Action — by design.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAdminFromCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const admin = await resolveAdminFromCookie();
  if (!admin || admin.roomCode !== params.code.toUpperCase()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data: room } = await sb
    .from("rooms")
    .select("id, reveal_at, wishlist_deadline")
    .eq("id", admin.roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const update: Record<string, any> = {};

  // Handle Reveal Date
  if (body.revealAt) {
    const newReveal = new Date(body.revealAt);
    if (isNaN(newReveal.getTime())) {
      return NextResponse.json({ error: "Invalid reveal time." }, { status: 400 });
    }
    update.reveal_at = newReveal.toISOString();
  }

  // Handle Deadline
  if (body.wishlistDeadline) {
    const newDeadline = new Date(body.wishlistDeadline);
    if (isNaN(newDeadline.getTime())) {
      return NextResponse.json({ error: "Invalid wishlist deadline." }, { status: 400 });
    }

    // Ensure deadline is before reveal
    const compareReveal = update.reveal_at ? new Date(update.reveal_at) : new Date(room.reveal_at);
    if (newDeadline >= compareReveal) {
      return NextResponse.json({ error: "Wishlist deadline must be before reveal." }, { status: 400 });
    }
    update.wishlist_deadline = newDeadline.toISOString();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const upd = await sb.from("rooms").update(update).eq("id", admin.roomId);
  if (upd.error) {
    console.error("[update settings error]", upd.error);
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated: Object.keys(update).length });
}