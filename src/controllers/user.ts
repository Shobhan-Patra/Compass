import { ApiResponse } from '../utils/ApiResponse.ts';
import { ApiError } from '../utils/ApiError.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

import { type Request, type Response } from 'express';
import { clerkClient, getAuth, type User } from '@clerk/express';

const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }
  const user: User = await clerkClient.users.getUser(userId);
  return res.status(200).json(new ApiResponse(200, user));
});

export { getUserProfile };
