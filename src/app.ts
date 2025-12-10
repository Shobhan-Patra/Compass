import express from 'express';
import { type Express, type Request, type Response } from 'express';

const app: Express = express();

app.get('/healthcheck', (_: Request, res: Response) => {
  res.status(200).send('OK');
});

export default app;
