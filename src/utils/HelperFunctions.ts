import { usersTable } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { ApiError } from './ApiError.ts';
import db from '../db/db.ts';

async function getLocalUserOrThrow(clerkId: string) {
  const result = await db
    .select({ localId: usersTable.id, isNative: usersTable.isNative })
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  const user = result[0];
  if (!user) {
    throw new ApiError(404, 'Local userId not found; Sync required');
  }
  return user;
}

export { getLocalUserOrThrow };
