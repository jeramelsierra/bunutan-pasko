// API route, not a Server Action — by design.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAdminFromCookie, generateAccessToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string; id: string } }
) {
  const admin = await resolveAdminFromCookie();
  if (!admin || admin.roomCode !== params.code.toUpperCase()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  const { data: member } = await sb
    .from("members")
    .select("id, room_id")
    .eq("id", params.id)
    .eq("room_id", admin.roomId)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const newToken = generateAccessToken(32);
  const upd = await sb
    .from("members")
    .update({ access_token: newToken, pin_hash: null })
    .eq("id", member.id);

  if (upd.error) {
    return NextResponse.json(
      { error: "Could not re-issue link." },
      { status: 500 }
    );
  }

  // Return once, for the admin to hand to the member
  return NextResponse.json({
    ok: true,
    accessToken: newToken,
    note: "Member will need to set a new PIN on next login.",
  });
}