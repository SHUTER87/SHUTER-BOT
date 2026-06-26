export interface Warning {
  moderatorId: string;
  moderatorTag: string;
  reason: string;
  timestamp: Date;
}

const store = new Map<string, Warning[]>();

function key(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

export function addWarning(guildId: string, userId: string, warning: Warning): number {
  const k = key(guildId, userId);
  const existing = store.get(k) ?? [];
  existing.push(warning);
  store.set(k, existing);
  return existing.length;
}

export function getWarnings(guildId: string, userId: string): Warning[] {
  return store.get(key(guildId, userId)) ?? [];
}

export function clearWarnings(guildId: string, userId: string): number {
  const k = key(guildId, userId);
  const count = (store.get(k) ?? []).length;
  store.delete(k);
  return count;
}
