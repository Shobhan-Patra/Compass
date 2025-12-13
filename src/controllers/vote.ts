import { ApiResponse } from '../utils/ApiResponse.ts';
import { ApiError } from '../utils/ApiError.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

import { type Request, type Response } from 'express';

import db from '../db/db.ts';
import { getAuth } from '@clerk/express';
import { getLocalUserOrThrow } from '../utils/HelperFunctions.ts';
import { votesTable } from '../db/schema.ts';
import { and, count, eq } from 'drizzle-orm';

const votePost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const postId = req.params.postId;
  const { voteType } = req.body;
  if (!userId) throw new ApiError(401, 'Not authenticated');
  if (!postId) throw new ApiError(400, 'Invalid Post Id');
  if (!voteType || !['UP', 'DOWN'].includes(voteType)) throw new ApiError(400, 'Invalid Vote Type');

  const parsedPostId = parseInt(postId);
  if (isNaN(parsedPostId)) throw new ApiError(403, 'Invalid Post Id provided');

  const localUser = await getLocalUserOrThrow(userId);

  const existingVote = await db
    .select({ id: votesTable.id, voteType: votesTable.type })
    .from(votesTable)
    .where(eq(votesTable.votedBy, localUser.localId));

  let voteResult: any;

  if (existingVote) {
    voteResult = await db
      .update(votesTable)
      .set({
        type: voteType,
      })
      .where(and(eq(votesTable.votedBy, localUser.localId), eq(votesTable.postId, parsedPostId)))
      .returning();
  } else {
    voteResult = await db
      .insert(votesTable)
      .values({
        postId: parsedPostId,
        votedBy: localUser.localId,
        type: voteType,
      })
      .returning();
  }

  if (voteResult.length === 0) {
    throw new ApiError(400, 'Something went wrong while voting');
  }

  return res.status(200).json(new ApiResponse(200, voteResult[0], 'Voted successfully'));
});

const removeVote = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const postId = req.params.postId;
  if (!userId) throw new ApiError(401, 'Not authenticated');
  if (!postId) throw new ApiError(400, 'Invalid Post Id');

  const parsedPostId = parseInt(postId);
  if (isNaN(parsedPostId)) throw new ApiError(403, 'Invalid Post Id provided');

  const localUser = await getLocalUserOrThrow(userId);

  const deleteVoteResult = await db
    .delete(votesTable)
    .where(and(eq(votesTable.postId, parsedPostId), eq(votesTable.votedBy, localUser.localId)))
    .returning({ id: votesTable.id });

  console.log(deleteVoteResult);
  if (deleteVoteResult.length === 0)
    throw new ApiError(404, `Vote not found on post ${parsedPostId}`);

  return res
    .status(200)
    .json(new ApiResponse(200, deleteVoteResult[0], 'Vote deleted successfully'));
});

export { votePost, removeVote };
