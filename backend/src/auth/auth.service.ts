import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { randomUUID } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = (await this.prisma.user.findUnique({
      where: { email },
    })) as unknown as {
      id: string;
      email: string;
      role: UserRole;
      firstName: string | null;
      lastName: string | null;
      passwordHash: string | null;
    } | null;
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwt.signAsync(payload);
    return {
      success: true,
      data: {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  async setPassword(userId: string, password: string) {
    if (password.length < 6)
      throw new BadRequestException("Password too short");
    const hash = await bcrypt.hash(password, 10);
    await this.prisma
      .$executeRaw`UPDATE "users" SET "passwordHash" = ${hash} WHERE id = ${userId}`;
    return { success: true };
  }

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException("Email already registered");
    const user = await this.prisma.user.create({
      data: {
        email,
        role: UserRole.USER,
        isActive: true,
        clerkId: `local_${randomUUID()}`,
      },
    });
    await this.setPassword(user.id, password);
    return { success: true, data: { id: user.id, email: user.email } };
  }
}
