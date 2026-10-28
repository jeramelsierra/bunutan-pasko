// API route, not a Server Action — by design.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveMemberFromCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const me = await resolveMemberFromCookie();
  if (!me) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  // --- NEW: PIN LOCK CHECK ---
  const { data: memberData } = await sb
    .from("members")
    .select("pin_hash")
    .eq("id", me.memberId)
    .single();

  const pinCookie = cookies().get("bunutan_pin_verified")?.value;

  if (memberData?.pin_hash && pinCookie !== me.memberId) {
    // They have a PIN, but haven't verified it in this session
    return NextResponse.json(
      { error: "PIN required", requiresPin: true },
      { status: 403 }
    );
  }
  // ---------------------------

  const { data: room } = await sb
    .from("rooms")
    .select(
      "id, code, name, price_range, reveal_at, wishlist_deadline, drawn_at, gift_mode, theme"
    )
    .eq("id", me.roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const now = new Date();
  const revealAt = new Date(room.reveal_at);
  const deadline = new Date(room.wishlist_deadline);

  const revealPassed = now >= revealAt && !!room.drawn_at;
  const wishlistLocked = now >= deadline;

  const { data: ownWishlist } = await sb
    .from("wishlists")
    .select("position, text, url")
    .eq("member_id", me.memberId)
    .order("position", { ascending: true });

  let assignment: {
    monitoName: string;
    wishlist: { position: number; text: string; url: string | null }[];
    theme: string | null;
  } | null = null;

  if (revealPassed) {
    const { data: row } = await sb
      .from("assignments")
      .select("receiver_member_id")
      .eq("giver_member_id", me.memberId)
      .eq("room_id", room.id)
      .maybeSingle();

    if (row) {
      const { data: receiver } = await sb
        .from("members")
        .select("id, name")
        .eq("id", row.receiver_member_id)
        .single();

      const { data: wishlist } = await sb
        .from("wishlists")
        .select("position, text, url")
        .eq("member_id", row.receiver_member_id)
        .order("position", { ascending: true });

      if (receiver) {
        assignment = {
          monitoName: receiver.name,
          wishlist: wishlist ?? [],
          theme: room.theme,
        };
      }
    }
  }

  return NextResponse.json({
    ok: true,
    me: {
      memberId: me.memberId,
      name: me.memberName,
      isAdmin: me.isAdmin,
    },
    room: {
      code: room.code,
      name: room.name,
      priceRange: room.price_range,
      revealAt: room.reveal_at,
      wishlistDeadline: room.wishlist_deadline,
      drawnAt: room.drawn_at,
      revealPassed,
      wishlistLocked,
      giftMode: room.gift_mode,
      theme: room.theme,
    },
    ownWishlist: ownWishlist ?? [],
    assignment,
  });
}