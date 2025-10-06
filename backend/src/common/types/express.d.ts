import { RequestUser } from '../../auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
