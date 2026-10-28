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
    .select("id, reveal_at, wishlist_deadline, price_range, drawn_at")
    .eq("id", admin.roomId)
    .single();
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const update: Record<string, any> = {};

  if (typeof body.priceRange === "string") {
    const v = body.priceRange.trim();
    if (!v || v.length > 60) {
      return NextResponse.json(
        { error: "Price range must be 1–60 characters." },
        { status: 400 }
      );
    }
    update.price_range = v;
  }

  let newReveal: Date | null = null;
  if (body.revealAt) {
    newReveal = new Date(body.revealAt);
    if (isNaN(newReveal.getTime())) {
      return NextResponse.json(
        { error: "Invalid reveal time." },
        { status: 400 }
      );
    }
    // If already revealed (reveal happened and drawn), forbid moving reveal backwards in time
    if (room.drawn_at) {
      const currentReveal = new Date(room.reveal_at);
      const alreadyRevealed = new Date() >= currentReveal;
      if (alreadyRevealed) {
        return NextResponse.json(
          { error: "Cannot change reveal time after it has already passed." },
          { status: 403 }
        );
      }
      // Before reveal: allowed to change as long as it stays in the future
      if (newReveal <= new Date()) {
        return NextResponse.json(
          { error: "New reveal time must be in the future." },
          { status: 400 }
        );
      }
    } else if (newReveal <= new Date()) {
      return NextResponse.json(
        { error: "Reveal time must be in the future." },
        { status: 400 }
      );
    }
    update.reveal_at = newReveal.toISOString();
  }

  if (body.wishlistDeadline) {
    const deadline = new Date(body.wishlistDeadline);
    if (isNaN(deadline.getTime())) {
      return NextResponse.json(
        { error: "Invalid wishlist deadline." },
        { status: 400 }
      );
    }
    const compareTo = newReveal ?? new Date(room.reveal_at);
    if (deadline >= compareTo) {
      return NextResponse.json(
        { error: "Wishlist deadline must be before reveal." },
        { status: 400 }
      );
    }
    update.wishlist_deadline = deadline.toISOString();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const upd = await sb.from("rooms").update(update).eq("id", admin.roomId);
  if (upd.error) {
    return NextResponse.json(
      { error: "Could not save settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, updated: Object.keys(update).length });
}