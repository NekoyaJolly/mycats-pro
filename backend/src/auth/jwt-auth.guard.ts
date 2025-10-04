import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// 開発用: AUTH_DISABLED=1 のとき認証をバイパスしダミーユーザーを注入
// 本番運用では必ず AUTH_DISABLED を未設定/0 にすること。

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
			async canActivate(context: ExecutionContext): Promise<boolean> {
				if (process.env.AUTH_DISABLED === "1") {
					const req = context.switchToHttp().getRequest();
					if (!req.user) {
						req.user = {
							userId: "dev-admin",
							email: "dev-admin@example.com",
							role: "ADMIN",
						} as { userId: string; email: string; role: string };
					}
					return true;
				}
					const result = super.canActivate(context);
					if (typeof result === "boolean") {
						return result;
					}
					if (typeof result === "object" && typeof (result as Promise<boolean>).then === "function") {
						return await (result as Promise<boolean>);
					}
					if (typeof result === "object" && typeof (result as any).subscribe === "function") {
						// Observable<boolean>をPromise化
						return new Promise<boolean>((resolve, reject) => {
							(result as any).subscribe({ next: resolve, error: reject });
						});
					}
					throw new Error("Unexpected return type from canActivate");
			}
}
