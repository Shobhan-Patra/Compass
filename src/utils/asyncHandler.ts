/*
  Wraps an async request handler and catches any errors,
  forwarding them to the next() function (Express error middleware).
*/
import { type Request, type Response, type NextFunction } from 'express';

type RequestHandlerAsync = (req: Request, res: Response, next: NextFunction) => Promise<any> | void;

const asyncHandler = (requestHandler: RequestHandlerAsync) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Convert the async function to a Promise and catch any errors
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
