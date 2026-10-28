export type DrawResult = {
  giver_member_id: string;
  receiver_member_id: string;
};

function sattoloShuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function deriveDerangement(memberIds: string[]): DrawResult[] {
  const n = memberIds.length;
  if (n < 2) {
    throw new Error("Need at least 2 members to draw.");
  }

  const MAX_ATTEMPTS = 1000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const receivers = sattoloShuffle(memberIds);
    const isDerangement = memberIds.every((giver, i) => giver !== receivers[i]);
    if (isDerangement) {
      return memberIds.map((giver, i) => ({
        giver_member_id: giver,
        receiver_member_id: receivers[i],
      }));
    }
  }

  throw new Error(
    "Could not derive a valid derangement after many attempts."
  );
}

export function validateDraw(memberIds: string[], result: DrawResult[]): void {
  const giverSet = new Set(result.map((r) => r.giver_member_id));
  const receiverSet = new Set(result.map((r) => r.receiver_member_id));

  if (result.length !== memberIds.length) {
    throw new Error("Draw size mismatch: not every member has an assignment.");
  }
  if (giverSet.size !== memberIds.length) {
    throw new Error("Duplicate giver in draw.");
  }
  if (receiverSet.size !== memberIds.length) {
    throw new Error("Duplicate receiver in draw.");
  }
  for (const pair of result) {
    if (pair.giver_member_id === pair.receiver_member_id) {
      throw new Error("Self-pick detected.");
    }
  }
  for (const id of memberIds) {
    if (!giverSet.has(id) || !receiverSet.has(id)) {
      throw new Error("Member missing from draw.");
    }
  }
}