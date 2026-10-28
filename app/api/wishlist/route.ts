// API route, not a Server Action — by design.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveMemberFromCookie } from "@/lib/auth";
import { validateWishlistItem } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  const me = await resolveMemberFromCookie();
  if (!me) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  // Load room to check gift_mode + deadline
  const { data: room } = await sb
    .from("rooms")
    .select("wishlist_deadline, gift_mode")
    .eq("id", me.roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.gift_mode === "theme") {
    return NextResponse.json(
      { error: "This room uses a theme instead of wish lists." },
      { status: 403 }
    );
  }

  if (new Date() >= new Date(room.wishlist_deadline)) {
    return NextResponse.json(
      { error: "Wishlist is locked — the deadline has passed." },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items) {
    return NextResponse.json(
      { error: "Expected { items: [...] }" },
      { status: 400 }
    );
  }
  if (items.length > 3) {
    return NextResponse.json(
      { error: "Maximum 3 wish list items." },
      { status: 400 }
    );
  }

  const cleaned: { position: number; text: string; url: string | null }[] = [];
  for (const raw of items) {
    const parsed = validateWishlistItem(raw);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    cleaned.push({
      position: parsed.value.position,
      text: parsed.value.text,
      url: parsed.value.url ?? null,
    });
  }

  const positions = new Set(cleaned.map((c) => c.position));
  if (positions.size !== cleaned.length) {
    return NextResponse.json(
      { error: "Duplicate wishlist positions are not allowed." },
      { status: 400 }
    );
  }

  const del = await sb.from("wishlists").delete().eq("member_id", me.memberId);
  if (del.error) {
    return NextResponse.json(
      { error: "Could not update wishlist." },
      { status: 500 }
    );
  }

  if (cleaned.length > 0) {
    const ins = await sb.from("wishlists").insert(
      cleaned.map((c) => ({
        member_id: me.memberId,
        position: c.position,
        text: c.text,
        url: c.url,
      }))
    );
    if (ins.error) {
      return NextResponse.json(
        { error: "Could not save wishlist." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, saved: cleaned.length });
}

export async function GET() {
  const me = await resolveMemberFromCookie();
  if (!me) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("wishlists")
    .select("position, text, url")
    .eq("member_id", me.memberId)
    .order("position", { ascending: true });
  return NextResponse.json({ ok: true, items: data ?? [] });
}