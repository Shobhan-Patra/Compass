import express from 'express';
import { type Express, type Request, type Response } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

const expressServer: Express = express();

expressServer.use(express.json());
expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(clerkMiddleware());

expressServer.get('/', (_: Request, res: Response) => {
  res.status(200).send('This is the landing/signup page,\nYou need to login');
});

expressServer.get('/api/v1/healthcheck', (_: Request, res: Response) => {
  res.status(200).send('OK');
});

import userRouter from './routes/user.ts';
import postRouter from './routes/post.ts';
import voteRouter from './routes/vote.ts';

expressServer.use('/api/v1/user', requireAuth(), userRouter);
expressServer.use('/api/v1/posts', requireAuth(), postRouter);
expressServer.use('/api/v1/vote/', requireAuth(), voteRouter);

export default expressServer;
