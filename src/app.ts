import express from 'express';
import { type Express, type Request, type Response } from 'express';
import { clerkClient, clerkMiddleware, requireAuth, getAuth } from '@clerk/express';

const expressServer: Express = express();

expressServer.use(express.json());
expressServer.use(express.urlencoded({ extended: true }));
expressServer.use(clerkMiddleware());

expressServer.get('/healthcheck', (_: Request, res: Response) => {
  res.status(200).send('OK');
});

expressServer.get('/protected', requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  const user = await clerkClient.users.getUser(userId);
  return res.json({
    user: user,
  });
});

export default expressServer;
