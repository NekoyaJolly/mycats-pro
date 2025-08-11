import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { LoginAttemptService } from './login-attempt.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'fake-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret',
                ARGON2_MEMORY_COST: '65536',
                ARGON2_TIME_COST: '3',
                ARGON2_PARALLELISM: '4',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(() => Promise.resolve('hashed-password')),
            verify: jest.fn(() => Promise.resolve(true)),
          },
        },
        {
          provide: LoginAttemptService,
          useValue: {
            checkAndRecordAttempt: jest.fn(() => Promise.resolve({ allowed: true })),
            clearFailedAttempts: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
