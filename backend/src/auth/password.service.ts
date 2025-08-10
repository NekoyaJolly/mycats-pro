import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";

export interface Argon2Config {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
  hashLength: number;
  saltLength: number;
}

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly argon2Config: Argon2Config;

  constructor(private readonly configService: ConfigService) {
    this.argon2Config = {
      memoryCost: this.configService.get<number>("ARGON2_MEMORY_COST", 65536),
      timeCost: this.configService.get<number>("ARGON2_TIME_COST", 3),
      parallelism: this.configService.get<number>("ARGON2_PARALLELISM", 4),
      hashLength: this.configService.get<number>("ARGON2_HASH_LENGTH", 64),
      saltLength: this.configService.get<number>("ARGON2_SALT_LENGTH", 32),
    };

    this.logger.log("PasswordService initialized with Argon2id configuration");
  }

  /**
   * パスワードをArgon2idでハッシュ化
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: this.argon2Config.memoryCost,
        timeCost: this.argon2Config.timeCost,
        parallelism: this.argon2Config.parallelism,
        hashLength: this.argon2Config.hashLength,
      });

      this.logger.debug("Password successfully hashed with Argon2id");
      return hash;
    } catch (error) {
      this.logger.error("Failed to hash password:", error);
      throw new Error("Password hashing failed");
    }
  }

  /**
   * パスワードを検証
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await argon2.verify(hash, password);
      this.logger.debug(
        `Password verification: ${isValid ? "success" : "failed"}`,
      );
      return isValid;
    } catch (error) {
      this.logger.error("Failed to verify password:", error);
      return false;
    }
  }

  /**
   * パスワード強度チェック
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const minLength = this.configService.get<number>("PASSWORD_MIN_LENGTH", 8);

    if (password.length < minLength) {
      errors.push(`パスワードは${minLength}文字以上である必要があります`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push("パスワードには小文字を含める必要があります");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("パスワードには大文字を含める必要があります");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("パスワードには数字を含める必要があります");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("パスワードには特殊文字を含める必要があります");
    }

    // 連続する文字チェック
    if (/(.)\1{2,}/.test(password)) {
      errors.push(
        "パスワードに同じ文字を3回以上連続で使用することはできません",
      );
    }

    // よくある弱いパスワードパターンをチェック
    const weakPatterns = [/123456/, /password/i, /qwerty/i, /admin/i, /guest/i];

    if (weakPatterns.some((pattern) => pattern.test(password))) {
      errors.push("よく使われるパスワードパターンは使用できません");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * ハッシュがArgon2かどうかチェック
   */
  isArgon2Hash(hash: string): boolean {
    return hash.startsWith("$argon2");
  }

  /**
   * bcryptハッシュからArgon2への移行チェック
   */
  needsMigration(hash: string): boolean {
    return (
      hash.startsWith("$2a$") ||
      hash.startsWith("$2b$") ||
      hash.startsWith("$2y$")
    );
  }
}
