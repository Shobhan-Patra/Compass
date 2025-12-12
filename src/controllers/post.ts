import { ApiResponse } from '../utils/ApiResponse.ts';
import { ApiError } from '../utils/ApiError.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

import { type Request, type Response } from 'express';
import { getAuth } from '@clerk/express';

import db from '../db/db.ts';
import { type InsertPost, postsTable, usersTable } from '../db/schema.ts';
import { and, eq, sql } from 'drizzle-orm';

const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const localUserResult = await db
    .select({ localId: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  const localUserId = localUserResult[0]?.localId;
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

const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { title, content } = req.body;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }
  if (!title || !content) {
    throw new ApiError(400, 'Invalid Post Title or Content');
  }

  const localUserResult = await db
    .select({ localId: usersTable.id, isNative: usersTable.isNative })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  const localUserId = localUserResult[0]?.localId;
  const isNativeUser = localUserResult[0]?.isNative;
  if (!localUserId) {
    throw new ApiError(404, 'Local userId not found; Sync required');
  }

  const newPost: InsertPost = {
    title: title,
    content: content,
    tag: isNativeUser ?? false,
    createdBy: localUserId,
  };

  const newPostResult = await db.insert(postsTable).values(newPost).returning({
    title: postsTable.title,
    content: postsTable.content,
    tag: postsTable.tag,
    createdAt: postsTable.createdAt,
    lastUpdatedAt: postsTable.lastUpdatedAt,
  });

  return res.status(200).json(new ApiResponse(201, newPostResult[0], 'Post created successfully'));
});

const editPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const postId = req.params.postId;
  let { title, content } = req.body;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }
  if (!postId) {
    throw new ApiError(400, 'Invalid Post Id');
  }

  const parsedPostId = parseInt(postId);
  if (isNaN(parsedPostId)) {
    throw new ApiError(403, 'Invalid Post Id provided');
  }

  const dataToEdit: any = {};
  if (title) dataToEdit.title = title;
  if (content) dataToEdit.content = content;
  if (!dataToEdit.title && !dataToEdit.content) {
    throw new ApiError(400, 'Provide a new title or new content');
  }
  dataToEdit.lastUpdatedAt = sql`CURRENT_TIMESTAMP`;

  const localUserResult = await db
    .select({ localId: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  const localUserId = localUserResult[0]?.localId;
  if (!localUserId) {
    throw new ApiError(404, 'Local userId not found; Sync required');
  }

  const editPostResult = await db
    .update(postsTable)
    .set(dataToEdit)
    .where(and(eq(postsTable.id, parsedPostId), eq(postsTable.createdBy, localUserId)))
    .returning({
      title: postsTable.title,
      content: postsTable.content,
      tag: postsTable.tag,
      createdAt: postsTable.createdAt,
      lastUpdatedAt: postsTable.lastUpdatedAt,
    });

  console.log(editPostResult);
  if (editPostResult.length === 0) {
    throw new ApiError(404, 'Post not found or you are not authorized to edit it');
  }

  return res.status(200).json(new ApiResponse(200, editPostResult[0], 'Post updated successfully'));
});

const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const postId = req.params.postId;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }
  if (!postId) {
    throw new ApiError(400, 'Invalid Post Id');
  }

  const localUserResult = await db
    .select({ localId: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  const localUserId = localUserResult[0]?.localId;
  if (!localUserId) {
    throw new ApiError(404, 'Local userId not found; Sync required');
  }

  const DeletePostResult = await db
    .delete(postsTable)
    .where(and(eq(postsTable.id, parseInt(postId)), eq(postsTable.createdBy, localUserId)));

  console.log(DeletePostResult);
  // if (DeletePostResult.length === 0) {
  //     throw new ApiError(404, 'Post not found or you are not authorized to edit it');
  // }

  return res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

export { getUserPosts, createPost, editPost, deletePost };
