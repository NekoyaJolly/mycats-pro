import type { UserRole } from "@prisma/client";
export type { UserRole };

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  userId: string;
  email?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
}
