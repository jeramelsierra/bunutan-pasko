import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAdminFromCookie, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const admin = await resolveAdminFromCookie();
  if (!admin || admin.roomCode !== params.code.toUpperCase()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  // Find the admin's member profile
  const { data: member } = await sb
    .from("members")
    .select("id, access_token")
    .eq("room_id", admin.roomId)
    .eq("is_admin", true)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Admin member profile not found" }, { status: 404 });
  }

  // Set the session cookie to the admin's member token
  setSessionCookie(member.access_token);

  return NextResponse.json({ ok: true });
}