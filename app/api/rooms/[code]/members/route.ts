import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAdminFromCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  // 1. Verify Admin Cookie
  const admin = await resolveAdminFromCookie();
  if (!admin || admin.roomCode !== params.code.toUpperCase()) {
    return NextResponse.json({ error: "Not authorized as admin" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  const { data: members } = await sb
    .from("members")
    .select("id, name, joined_at, pin_hash")
    .eq("room_id", admin.roomId)
    .order("joined_at", { ascending: true });

  const ids = (members ?? []).map((m) => m.id);
  const { data: wishes } = ids.length
    ? await sb.from("wishlists").select("member_id").in("member_id", ids)
    : { data: [] as { member_id: string }[] };

  const wishCounts = new Map<string, number>();
  for (const w of wishes ?? []) {
    wishCounts.set(w.member_id, (wishCounts.get(w.member_id) ?? 0) + 1);
  }

  return NextResponse.json({
    ok: true,
    members: (members ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      joinedAt: m.joined_at,
      hasPin: !!m.pin_hash,
      wishCount: wishCounts.get(m.id) ?? 0,
    })),
  });
}