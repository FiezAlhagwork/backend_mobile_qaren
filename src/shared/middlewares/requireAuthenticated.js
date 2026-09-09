import { getAuth } from '@clerk/express';
import AppError from '../utils/AppError.js';


export const requireAuthenticated = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return next(new AppError('Unauthorized — valid session required', 401));
  }

  next();
};