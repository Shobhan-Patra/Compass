import express from 'express';
import { type Express, type Request, type Response } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

const expressServer: Express = express();

expressServer.use(express.json());
expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(clerkMiddleware());

expressServer.get('/healthcheck', (_: Request, res: Response) => {
  res.status(200).send('OK');
});

import userRouter from './routes/user';

expressServer.use('/userprofile', requireAuth(), userRouter);

export default expressServer;
