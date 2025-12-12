// import {ApiResponse} from "../utils/ApiResponse.ts";
// import {ApiError} from "../utils/ApiError.ts";
// import {asyncHandler} from "../utils/asyncHandler.ts";
//
// import { type Request, type Response } from "express";
// import {clerkClient, getAuth} from "@clerk/express";
//
// import { SelectPost } from "../db/schema.ts";
//
// const getPosts = asyncHandler(async (req: Request, res: Response) => {
//     const { userId } = getAuth(req);
//     if (!userId) {
//         throw new Error('Not authenticated');
//     }
//     const user = await clerkClient.users.getUser(userId);
//
//
// })
