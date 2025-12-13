import { ApiResponse } from '../utils/ApiResponse.ts';
import { ApiError } from '../utils/ApiError.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

import { type Request, type Response } from 'express';
import { getAuth } from '@clerk/express';

import db from '../db/db.ts';
import { type InsertPost, postsTable, usersTable, votesTable } from '../db/schema.ts';
import { and, eq, sql } from 'drizzle-orm';
import { getLocalUserOrThrow } from '../utils/HelperFunctions.ts';

async function getAllVotesOfPost(postId: number) {
  if (!postId) throw new ApiError(400, 'Invalid Post Id');

  const votes = await db
    .select({
      upvoteCount: sql<number>`cast(count(case when ${votesTable.type} = 'UP' then 1 end) as int)`,
      downvoteCount: sql<number>`cast(count(case when ${votesTable.type} = 'DOWN' then 1 end) as int)`,
    })
    .from(votesTable)
    .where(eq(votesTable.postId, postId));

  const voteData = votes[0] || { upvoteCount: 0, downvoteCount: 0 };
  console.log(voteData);

  return voteData;
}

const readPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const postId = req.params.postId;
  if (!userId) throw new ApiError(401, 'Not authenticated');
  if (!postId) throw new ApiError(400, 'Invalid Post Id');

  const parsedPostId = parseInt(postId);
  if (isNaN(parsedPostId)) throw new ApiError(403, 'Invalid Post Id provided');

  const postResult: any = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, parsedPostId))
    .limit(1);

  if (postResult.length === 0) {
    throw new ApiError(404, 'Post not found');
  }

  const votes = await getAllVotesOfPost(parsedPostId);
  postResult[0].upvoteCount = votes.upvoteCount;
  postResult[0].downvoteCount = votes.downvoteCount;

  return res.status(200).json(new ApiResponse(200, postResult[0], 'Post fetched successfully'));
});

const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { title, content } = req.body;
  if (!userId) throw new ApiError(401, 'Not authenticated');
  if (!title || !content) throw new ApiError(400, 'Invalid Post Title or Content');

  const localUser = await getLocalUserOrThrow(userId);

  const newPost: InsertPost = {
    title: title,
    content: content,
    tag: localUser.isNative ?? false,
    createdBy: localUser.localId,
  };

  const newPostResult = await db.insert(postsTable).values(newPost).returning({
    id: postsTable.id,
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
  if (!userId) throw new ApiError(401, 'Not authenticated');
  if (!postId) throw new ApiError(400, 'Invalid Post Id');

  const parsedPostId = parseInt(postId);
  if (isNaN(parsedPostId)) throw new ApiError(403, 'Invalid Post Id provided');

  const dataToEdit: any = {};
  if (title) dataToEdit.title = title;
  if (content) dataToEdit.content = content;
  if (!dataToEdit.title && !dataToEdit.content) {
    throw new ApiError(400, 'Provide a new title or new content');
  }
  dataToEdit.lastUpdatedAt = sql`CURRENT_TIMESTAMP`;

  const localUser = await getLocalUserOrThrow(userId);

  const editPostResult = await db
    .update(postsTable)
    .set(dataToEdit)
    .where(and(eq(postsTable.id, parsedPostId), eq(postsTable.createdBy, localUser.localId)))
    .returning({
      title: postsTable.title,
      content: postsTable.content,
      tag: postsTable.tag,
      createdAt: postsTable.createdAt,
      lastUpdatedAt: postsTable.lastUpdatedAt,
    });

  if (editPostResult.length === 0) {
    throw new ApiError(404, 'Post not found or you are not authorized to edit it');
  }

  return res.status(200).json(new ApiResponse(200, editPostResult[0], 'Post updated successfully'));
});

const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const postId = req.params.postId;
  if (!userId) throw new ApiError(401, 'Not authenticated');
  if (!postId) throw new ApiError(400, 'Invalid Post Id');

  const parsedPostId = parseInt(postId);
  if (isNaN(parsedPostId)) throw new ApiError(403, 'Invalid Post Id provided');

  const localUser = await getLocalUserOrThrow(userId);

  const DeletePostResult = await db
    .delete(postsTable)
    .where(and(eq(postsTable.id, parseInt(postId)), eq(postsTable.createdBy, localUser.localId)))
    .returning({ id: postsTable.id });

  if (DeletePostResult.length === 0) {
    throw new ApiError(404, 'Post not found or you are not authorized to edit it');
  }

  return res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

const getAllPostsOfAUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  const userId = req.params.userId;
  if (!clerkId) throw new ApiError(401, 'Not authenticated');
  if (!userId) throw new ApiError(400, 'Invalid User Id');

  const parsedUserId = parseInt(userId);
  if (isNaN(parsedUserId)) throw new ApiError(400, 'Invalid User Id provided');

  const result = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, parsedUserId));

  const user = result[0];
  if (!user) {
    throw new ApiError(404, 'UserId not found');
  }

  const postResult = await db.select().from(postsTable).where(eq(postsTable.createdBy, user.id));

  // Appends vote counts to each individual post
  const postsWithVotes = await Promise.all(
    postResult.map(async (post: any) => {
      const parsedPostId = parseInt(post.id);
      const votes = await getAllVotesOfPost(parsedPostId);
      return {
        ...post,
        upvoteCount: votes.upvoteCount,
        downvoteCount: votes.downvoteCount,
      };
    }),
  );

  return res.status(200).json(new ApiResponse(200, postsWithVotes, 'Posts fetched successfully'));
});

export { readPost, createPost, editPost, deletePost, getAllPostsOfAUser };
