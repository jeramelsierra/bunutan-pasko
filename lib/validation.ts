export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type GiftMode = "wishlist" | "theme" | "both";

export type CreateRoomInput = {
  name: string;
  priceRange: string;
  revealAt: Date;
  wishlistDeadline: Date;
  giftMode: GiftMode;
  theme: string | null;
  adminName: string;
  adminPin: string;
  memberPin: string; // <-- ADDED
};

export type JoinRoomInput = {
  code: string;
  name: string;
  pin?: string | null;
};

export type WishlistItemInput = {
  position: 1 | 2 | 3;
  text: string;
  url?: string | null;
};

export function validateCreateRoom(raw: any): ValidationResult<CreateRoomInput> {
  if (!raw || typeof raw !== "object") return fail("Invalid payload");

  const name = String(raw.name ?? "").trim();
  if (name.length < 2 || name.length > 60) {
    return fail("Room name must be 2–60 characters.");
  }

  const adminName = String(raw.adminName ?? "").trim();
  if (adminName.length < 1 || adminName.length > 40) {
    return fail("Your name must be 1–40 characters.");
  }

  const adminPin = String(raw.adminPin ?? "").trim();
  if (!/^\d{6}$/.test(adminPin)) {
    return fail("Admin PIN must be exactly 6 digits.");
  }

  const memberPin = String(raw.memberPin ?? "").trim();
  if (!/^\d{6}$/.test(memberPin)) {
    return fail("Member PIN must be exactly 6 digits.");
  }

  const priceRange = String(raw.priceRange ?? "").trim();
  if (priceRange.length < 1 || priceRange.length > 60) {
    return fail("Price range is required (max 60 characters).");
  }

  const revealAt = parseDate(raw.revealAt);
  if (!revealAt) return fail("Reveal date/time is required and must be valid.");

  const wishlistDeadline = parseDate(raw.wishlistDeadline);
  if (!wishlistDeadline) return fail("Wishlist deadline is required.");
  if (wishlistDeadline >= revealAt) {
    return fail("Wishlist deadline must be before the reveal time.");
  }
  if (revealAt <= new Date()) {
    return fail("Reveal date/time must be in the future.");
  }

  const giftMode = String(raw.giftMode ?? "wishlist") as GiftMode;
  if (!["wishlist", "theme", "both"].includes(giftMode)) {
    return fail("Gift mode must be 'wishlist', 'theme', or 'both'.");
  }

  let theme: string | null = null;
  if (giftMode !== "wishlist") {
    theme = String(raw.theme ?? "").trim();
    if (theme.length < 2 || theme.length > 200) {
      return fail(
        giftMode === "theme"
          ? "A theme is required (2–200 characters) for theme-only rooms."
          : "Theme must be 2–200 characters if provided."
      );
    }
  }

  return {
    ok: true,
    value: { name, priceRange, revealAt, wishlistDeadline, giftMode, theme, adminName, adminPin, memberPin },
  };
}

const ROOM_CODE_PATTERN = /^[A-Z0-9]{5}$/;

export function validateJoinRoom(raw: any): ValidationResult<JoinRoomInput> {
  if (!raw || typeof raw !== "object") return fail("Invalid payload");

  const code = String(raw.code ?? "").toUpperCase().trim();
  if (!ROOM_CODE_PATTERN.test(code)) {
    return fail("Room code must be 5 letters/digits.");
  }

  const name = String(raw.name ?? "").trim();
  if (name.length < 1 || name.length > 40) {
    return fail("Your name must be 1–40 characters.");
  }

  let pin: string | null = null;
  if (raw.pin != null && raw.pin !== "") {
    pin = String(raw.pin).trim();
    if (!/^\d{6}$/.test(pin)) {
      return fail("PIN must be exactly 6 digits (or leave blank).");
    }
  }

  return { ok: true, value: { code, name, pin } };
}

export function validateWishlistItem(
  raw: any
): ValidationResult<WishlistItemInput> {
  if (!raw || typeof raw !== "object") return fail("Invalid payload");

  const posNum = Number(raw.position);
  if (![1, 2, 3].includes(posNum)) {
    return fail("Wishlist item position must be 1, 2, or 3.");
  }

  const text = String(raw.text ?? "").trim();
  if (text.length < 1 || text.length > 200) {
    return fail("Wishlist item text must be 1–200 characters.");
  }

  let url: string | null = null;
  if (raw.url != null && raw.url !== "") {
    const candidate = String(raw.url).trim();
    try {
      const u = new URL(candidate);
      if (!["http:", "https:"].includes(u.protocol)) {
        return fail("Wishlist link must be an http(s) URL.");
      }
      if (candidate.length > 500) return fail("Wishlist link is too long.");
      url = candidate;
    } catch {
      return fail("Wishlist link is not a valid URL.");
    }
  }

  return {
    ok: true,
    value: { position: posNum as 1 | 2 | 3, text, url },
  };
}

function parseDate(input: unknown): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === "string" || typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}