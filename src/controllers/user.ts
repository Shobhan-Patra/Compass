import { ApiResponse } from '../utils/ApiResponse.ts';
import { ApiError } from '../utils/ApiError.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

import { type Request, type Response } from 'express';
import { clerkClient, getAuth, type User } from '@clerk/express';

import db from '../db/db.ts';
import { usersTable, type InsertUser, postsTable } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

const syncUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { username, isNative } = req.body;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }
  if (!username) {
    throw new ApiError(400, 'Invalid username');
  }

  console.log('Clerk UserId: ', userId);

  const clerkUser: User = await clerkClient.users.getUser(userId);
  const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress;

  if (!clerkEmail) {
    throw new ApiError(400, 'User email is missing from Clerk data');
  }

  const userToInsert: InsertUser = {
    name: username,
    clerkId: userId,
    email: clerkEmail,
    isNative: isNative ?? false,
  };

  const [newUser] = await db
    .insert(usersTable)
    .values(userToInsert)
    .onConflictDoNothing()
    .returning({ localId: usersTable.id });

  const localId = newUser ? newUser.localId : 'Existed';

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        localId,
        newUser ? 'User profile synced successfully' : 'User already exists',
      ),
    );
});

const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }
  const user: User = await clerkClient.users.getUser(userId);
  const userProfile = {
    userId: user.id,
    username: user.username,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    isNative: user.publicMetadata.isNative,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return res.status(200).json(new ApiResponse(200, userProfile, 'User fetched successfully'));
});

const getCurrentUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const localUserResult = await db
    .select({ localId: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  const localUserId: number | undefined = localUserResult[0]?.localId;
  if (!localUserId) {
    throw new ApiError(404, 'Local userId not found; Sync required');
  }

  const userPostsResult = await db
    .select({
      postId: postsTable.id,
      postTitle: postsTable.title,
      postContent: postsTable.content,
      postCreatedAt: postsTable.createdAt,
    })
    .from(postsTable)
    .where(eq(postsTable.createdBy, localUserId));

  console.log(userPostsResult);

  return res.status(200).json(new ApiResponse(200, userPostsResult, 'Posts fetched successfully'));
});

export { syncUser, getUserProfile, getCurrentUserPosts };
