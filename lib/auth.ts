import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabase";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 5;
const PIN_SALT_ROUNDS = 10;
const PIN_PATTERN = /^\d{6}$/;

export const SESSION_COOKIE = "bunutan_session";
export const ADMIN_COOKIE = "bunutan_admin";

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export function generateAccessToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  if (!isValidPin(pin)) throw new Error("PIN must be exactly 6 digits");
  return bcrypt.hash(pin, PIN_SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!isValidPin(pin)) return false;
  return bcrypt.compare(pin, hash);
}

export type MemberSession = {
  memberId: string;
  roomId: string;
  isAdmin: boolean;
};

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
}

export function setAdminCookie(token: string) {
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
}

export function clearSessionCookies() {
  cookies().delete(SESSION_COOKIE);
  cookies().delete(ADMIN_COOKIE);
}

export async function resolveMemberFromCookie(): Promise<
  (MemberSession & { roomCode: string; memberName: string }) | null
> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sb = supabaseAdmin();
  const { data: member } = await sb
    .from("members")
    .select("id, room_id, name, is_admin, rooms!inner(code)")
    .eq("access_token", token)
    .maybeSingle();

  if (!member) return null;

  const room = (member as any).rooms;
  return {
    memberId: member.id,
    roomId: member.room_id,
    isAdmin: member.is_admin,
    roomCode: room.code,
    memberName: member.name,
  };
}

export async function resolveAdminFromCookie(): Promise<
  { roomId: string; roomCode: string } | null
> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const sb = supabaseAdmin();
  const { data: room } = await sb
    .from("rooms")
    .select("id, code")
    .eq("admin_token", token)
    .maybeSingle();

  if (!room) return null;
  return { roomId: room.id, roomCode: room.code };
}