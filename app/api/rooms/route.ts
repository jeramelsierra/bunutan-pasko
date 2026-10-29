import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateRoomCode, generateAccessToken, setAdminCookie, hashPin } from "@/lib/auth";
import { validateCreateRoom } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateCreateRoom(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { name, priceRange, revealAt, wishlistDeadline, giftMode, theme, adminName, adminPin, memberPin } = parsed.value;

  const sb = supabaseAdmin();

  // 1. Generate unique room code
  let code = generateRoomCode();
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data: existing } = await sb.from("rooms").select("id").eq("code", code).maybeSingle();
    if (!existing) break;
    code = generateRoomCode();
  }

  // 2. Generate tokens and hash the PIN
  const adminToken = generateAccessToken(32);
  const adminAccessToken = generateAccessToken(32);
  const pinHash = await hashPin(adminPin);
  const memberPinHash = await hashPin(memberPin);

  // 3. Create the room
  const { data: room, error: roomErr } = await sb
    .from("rooms")
    .insert({
      code,
      name,
      price_range: priceRange,
      reveal_at: revealAt.toISOString(),
      wishlist_deadline: wishlistDeadline.toISOString(),
      gift_mode: giftMode,
      theme: theme,
      admin_token: adminToken,
      admin_pin_hash: pinHash,
    })
    .select("id, code, name, price_range, reveal_at, wishlist_deadline, gift_mode, theme")
    .single();

  if (roomErr || !room) {
    console.error("[create room error]", roomErr);
    return NextResponse.json({ error: "Could not create room." }, { status: 500 });
  }

  // 4. Create the admin as a member of the room (so they can participate)
  const { error: memberErr } = await sb.from("members").insert({
    room_id: room.id,
    name: adminName,
    access_token: adminAccessToken,
    is_admin: true,
    pin_hash: memberPinHash,
  });

  if (memberErr) {
    // Rollback room creation if member insert fails
    await sb.from("rooms").delete().eq("id", room.id);
    console.error("[create admin member error]", memberErr);
    return NextResponse.json({ error: "Could not create admin member." }, { status: 500 });
  }

  // 5. Set the admin cookie
  setAdminCookie(adminToken);

  return NextResponse.json({
    ok: true,
    room: {
      code: room.code,
      name: room.name,
      priceRange: room.price_range,
      revealAt: room.reveal_at,
      wishlistDeadline: room.wishlist_deadline,
      giftMode: room.gift_mode,
      theme: room.theme,
    },
  });
}