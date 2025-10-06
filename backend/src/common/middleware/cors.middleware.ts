import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3005',
];

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const configuredOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
      : DEFAULT_ALLOWED_ORIGINS;

    const requestOrigin = req.headers.origin;
    let allowOrigin = '*';

    if (requestOrigin) {
      const match = configuredOrigins.find((origin) => origin === requestOrigin);
      if (match) {
        allowOrigin = match;
      } else if (process.env.NODE_ENV !== 'production') {
        allowOrigin = requestOrigin;
      }
    } else if (configuredOrigins.length > 0) {
      allowOrigin = configuredOrigins[0];
    }

    res.header('Access-Control-Allow-Origin', allowOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] ||
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie',
    );
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  }
}
