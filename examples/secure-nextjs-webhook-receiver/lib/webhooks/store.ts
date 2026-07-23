export interface IdempotencyStore {
  reserve(eventId: string, ttlSeconds: number): Promise<boolean>;
}

/** Demo-only store. Replace with Redis/SQL using a unique key in production. */
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly expiresAt = new Map<string, number>();

  async reserve(eventId: string, ttlSeconds: number): Promise<boolean> {
    const now = Date.now();
    for (const [key, expiry] of this.expiresAt) {
      if (expiry <= now) this.expiresAt.delete(key);
    }

    if (this.expiresAt.has(eventId)) return false;
    this.expiresAt.set(eventId, now + ttlSeconds * 1000);
    return true;
  }
}

export const idempotencyStore = new InMemoryIdempotencyStore();
